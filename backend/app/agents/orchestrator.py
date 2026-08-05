from typing import Dict, TypedDict, Any, List
from langgraph.graph import StateGraph, END
from app.core.logging import get_logger
from app.services.query_router import QueryRouter
from app.agents.rag_agent import RAGAgent
from app.agents.coding_agent import CodingAgent
from app.agents.math_agent import MathAgent
from app.agents.travel_agent import TravelAgent
from app.agents.search_agent import SearchAgent
from app.agents.shopping_agent import ShoppingAgent
from app.agents.general_agent import GeneralAgent
from app.agents.planner_agent import PlannerAgent
from app.agents.critic_agent import CriticAgent
from app.agents.vision_agent import VisionAgent
from langchain_groq import ChatGroq

logger = get_logger(__name__)

class GraphState(TypedDict):
    messages: List[Any]
    intent: str
    context: str
    agent_used: str
    critic_status: str
    revision_count: int
    image_url: str

class UniversalOrchestrator:
    def __init__(self, llm: ChatGroq, rag_service):
        self.llm = llm
        self.router = QueryRouter()
        
        # Instantiate Agents
        self.rag_agent = RAGAgent(rag_service)
        self.coding_agent = CodingAgent(llm)
        self.math_agent = MathAgent()
        self.travel_agent = TravelAgent()
        self.search_agent = SearchAgent()
        self.shopping_agent = ShoppingAgent()
        self.general_agent = GeneralAgent()
        self.planner_agent = PlannerAgent()
        self.critic_agent = CriticAgent(llm)
        self.vision_agent = VisionAgent()

        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(GraphState)

        # 1. Intent Detection Node
        workflow.add_node("detect_intent", self.detect_intent_node)
        
        # 2. Agent Nodes
        workflow.add_node("rag_agent", self.rag_agent.process)
        workflow.add_node("coding_agent", self.coding_agent.process)
        workflow.add_node("math_agent", self.math_agent.process)
        workflow.add_node("travel_agent", self.travel_agent.process)
        workflow.add_node("search_agent", self.search_agent.process)
        workflow.add_node("shopping_agent", self.shopping_agent.process)
        workflow.add_node("general_agent", self.general_agent.process)
        workflow.add_node("planner_agent", self.planner_agent.process)
        workflow.add_node("vision_agent", self.vision_agent.process)
        
        # 3. Response Generation Node (Shared)
        workflow.add_node("generate_response", self.generate_response_node)
        
        # 4. Critic Node
        workflow.add_node("critic_agent", self.critic_agent.process)

        # Edges
        workflow.set_entry_point("detect_intent")
        
        workflow.add_conditional_edges(
            "detect_intent",
            self.route_to_agent,
            {
                "VISION": "vision_agent",
                "CAMPUS": "rag_agent",
                "CODING": "coding_agent",
                "MATH": "math_agent",
                "TRAVEL": "travel_agent",
                "SEARCH": "search_agent",
                "SHOPPING": "shopping_agent",
                "PLANNER": "planner_agent",
                "GENERAL": "general_agent"
            }
        )

        # All agents go to the generator
        for agent in ["rag_agent", "coding_agent", "math_agent", "travel_agent", "search_agent", "shopping_agent", "planner_agent", "vision_agent", "general_agent"]:
            workflow.add_edge(agent, "generate_response")
            
        # Generator goes to Critic
        workflow.add_edge("generate_response", "critic_agent")
        
        # Critic decides to END or Loop back to generate_response
        workflow.add_conditional_edges(
            "critic_agent",
            self.route_critic,
            {
                "PASS": END,
                "REJECT": "generate_response"
            }
        )

        return workflow.compile()

    def detect_intent_node(self, state: GraphState) -> Dict:
        question = state["messages"][-1].content
        plan = self.router.generate_plan(question)
        intent = plan.intent
        
        # Map intents to the agent dictionary
        agent_map = {
            "CAMPUS": "CAMPUS",
            "HYBRID": "CAMPUS",
            "PERSONAL": "CAMPUS",
            "CODING": "CODING",
            "MATH": "MATH",
            "TRAVEL": "TRAVEL",
            "SHOPPING": "SHOPPING",
            "SEARCH": "SEARCH",
            "WEATHER": "SEARCH",
            "PLANNER": "PLANNER",
            "GREETING": "GENERAL",
            "SMALL_TALK": "GENERAL",
            "GENERAL": "GENERAL"
        }
        
        # Simple heuristic for Planner (could also be part of QueryRouter intent)
        if "plan" in question.lower() and "study" in question.lower():
            mapped_intent = "PLANNER"
        else:
            mapped_intent = agent_map.get(intent, "GENERAL")
            
        # Overwrite intent if an image URL is present
        if state.get("image_url"):
            mapped_intent = "VISION"
            
        logger.info(f"Orchestrator mapped intent '{intent}' to Agent '{mapped_intent}'")
        return {"intent": mapped_intent}

    def route_to_agent(self, state: GraphState) -> str:
        return state["intent"]

    def route_critic(self, state: GraphState) -> str:
        status = state.get("critic_status", "PASS")
        revision = state.get("revision_count", 0)
        
        # Max 1 revision to prevent infinite loops
        if status == "REJECT" and revision < 1:
            return "REJECT"
        return "PASS"

    def generate_response_node(self, state: GraphState) -> Dict:
        """
        Generates the final response by passing the context and user query to the LLM.
        We can bind tools to the LLM here if the context instructs it.
        """
        question = state["messages"][-1].content
        context = state.get("context", "")
        agent_used = state.get("agent_used", "unknown")
        
        logger.info(f"Generating response using context from {agent_used}")
        
        prompt = f"""
        System: You are CollegeMate AI, a professional Universal AI Assistant.
        Your primary goal is to help users solve problems accurately, efficiently, and honestly.
        You are NOT a simple chatbot. You are an intelligent assistant that can reason, plan, retrieve knowledge, use tools, and communicate naturally.

        GENERAL BEHAVIOR:
        - Understand the user's real intent before answering.
        - Think about whether the question requires: Internal knowledge, College knowledge (RAG), Web search, Calculator, Code execution, Maps, Weather, Currency, Vision, Memory.
        - Use the appropriate tool when available.
        - Never guess when reliable data should come from a tool.
        - If required information is missing, ask a concise clarifying question.
        - Be honest about uncertainty. Never invent facts.

        REASONING (Internal):
        Determine goal, info availability, tools needed, and follow-ups. Do not expose this reasoning to the user (e.g. no "Thinking...", "Planning...").
        Only provide the final helpful response.

        RESPONSE STYLE:
        - Professional, Friendly, Clear, Well structured, Easy to read.
        - Use Headings, Bullet points, Numbered steps, Tables, Code blocks, Examples.
        - Choose the best format automatically. Do not write long paragraphs unless necessary.

        ACCURACY:
        Always prioritize correctness over confidence. If uncertain, say "I couldn't verify that information." instead of guessing.

        RAG (College context):
        If the question is about the college, use retrieved college knowledge (e.g. Timetable, Departments, Faculty, Syllabus, Rules). Do not answer from general model knowledge if RAG data exists.

        WEB SEARCH:
        Use search for Latest news, Current prices, Recent events, Live info. Do not rely on model memory for time-sensitive info.

        CALCULATIONS & PROGRAMMING:
        Use calculator tools. Provide explanations, algorithms, code, complexity, and improvements for coding questions. Verify output if code execution is available.

        TRAVEL & SHOPPING:
        Provide overview, itineraries, budgets, comparisons, pros/cons. Do not invent ticket prices or product prices.

        VISION & MEMORY:
        If an image is uploaded, explain what is visible. Extract text. Never claim to see invisible details. Remember only long-term useful preferences when enabled.

        ERROR HANDLING:
        If a tool fails, explain the limitation clearly and continue helping. Never expose stack traces.
        
        Context provided by the {agent_used} agent:
        {context}
        
        User: {question}
        """
        
        # Tools could be bound here using self.llm.bind_tools(tools)
        # For this foundation phase, we let the LLM generate the response based on agent instructions.
        response = self.llm.invoke(prompt)
        
        revision = state.get("revision_count", 0) + 1
        return {"messages": [response], "revision_count": revision}

    def run(self, message: str) -> str:
        from langchain_core.messages import HumanMessage
        
        initial_state = {
            "messages": [HumanMessage(content=message)],
            "intent": "",
            "context": "",
            "agent_used": "",
            "image_url": ""
        }
        
        result = self.graph.invoke(initial_state)
        return result["messages"][-1].content

    async def arun(self, message: str) -> str:
        from langchain_core.messages import HumanMessage
        
        initial_state = {
            "messages": [HumanMessage(content=message)],
            "intent": "",
            "context": "",
            "agent_used": "",
            "critic_status": "PASS",
            "revision_count": 0,
            "image_url": ""
        }
        
        result = await self.graph.ainvoke(initial_state)
        return result["messages"][-1].content
        
    async def astream_response(self, message: str, image_url: str = ""):
        from langchain_core.messages import HumanMessage
        initial_state = {
            "messages": [HumanMessage(content=message)],
            "intent": "",
            "context": "",
            "agent_used": "",
            "critic_status": "PASS",
            "revision_count": 0,
            "image_url": image_url
        }
        
        # We simulate SSE status updates before awaiting the final result
        yield "Thinking..."
        
        # Since standard LangGraph `.astream()` streams state updates (which are full messages),
        # yielding intermediate text per node allows the frontend to show progress.
        async for event in self.graph.astream(initial_state):
            for node, state in event.items():
                if node == "detect_intent":
                    yield "Analyzing your request..."
                elif node == "rag_agent":
                    yield "Searching college knowledge base..."
                elif node == "coding_agent":
                    yield "Writing code..."
                elif node == "travel_agent" or node == "planner_agent":
                    yield "Creating plan..."
                elif node == "vision_agent":
                    yield "Analyzing image..."
                elif node == "generate_response":
                    yield "Generating final response..."
                elif node == "critic_agent":
                    if state.get("critic_status") == "REJECT":
                        yield "Revising answer for better accuracy..."
                        
        final_state = await self.graph.ainvoke(initial_state)
        yield "Final Answer: " + final_state["messages"][-1].content

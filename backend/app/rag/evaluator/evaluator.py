import json
import asyncio
from pathlib import Path
from typing import Dict, Any

from app.services.ai_service import AIService
from app.core.logging import get_logger

logger = get_logger(__name__)

class RAGEvaluator:
    def __init__(self):
        self.ai_service = AIService()
        self.dataset_path = Path(__file__).parent / "campus_questions.json"

    async def evaluate_all(self):
        if not self.dataset_path.exists():
            logger.error("Dataset not found at %s", self.dataset_path)
            return

        with open(self.dataset_path, "r", encoding="utf-8") as f:
            dataset = json.load(f)

        total_questions = len(dataset)
        correct_count = 0
        hallucination_count = 0

        logger.info(f"Starting RAG Evaluation on {total_questions} questions.")

        for item in dataset:
            question = item["question"]
            expected = item["expected_answer"]
            
            try:
                # Ask AI Service
                answer = await self.ai_service.get_chat_answer(question)
                
                # Naive Keyword Evaluation (In a real production system, use an LLM-as-a-judge here)
                if expected.lower() in answer.lower():
                    correct_count += 1
                elif "couldn't find" in answer.lower():
                    hallucination_count += 1 # Or mark as "No Info" depending on the dataset
                else:
                    # If it answered something else without the expected keywords
                    logger.warning("Potential mismatch or hallucination on: %s", question)
            except Exception as e:
                logger.error("Error evaluating question '%s': %s", question, e)

        acc = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        hall_rate = (hallucination_count / total_questions) * 100 if total_questions > 0 else 0

        logger.info("====================================")
        logger.info("       RAG Evaluation Report        ")
        logger.info("====================================")
        logger.info(f"Total Questions    : {total_questions}")
        logger.info(f"Retrieval Accuracy : {acc:.2f}%")
        logger.info(f"Hallucination Rate : {hall_rate:.2f}%")
        logger.info("====================================")

if __name__ == "__main__":
    evaluator = RAGEvaluator()
    asyncio.run(evaluator.evaluate_all())

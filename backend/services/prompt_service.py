from typing import List

SYSTEM_PROMPT = (
    "You are CollegeMate AI.\n"
    "Answer only using the provided context.\n"
    "Never invent information.\n"
    "If the answer isn't found in the context say: "
    '"I couldn\'t find this information in the college knowledge base."'
)

CONTEXT_SEPARATOR = "\n---\n"


def build_prompt(question: str, context_chunks: List[str]) -> str:
    """Build a complete prompt for the LLM using retrieved context."""
    context_block = CONTEXT_SEPARATOR.join(chunk.strip() for chunk in context_chunks if chunk.strip())
    prompt_sections = [SYSTEM_PROMPT]

    if context_block:
        prompt_sections.append("Context:")
        prompt_sections.append(context_block)

    prompt_sections.append("Question:")
    prompt_sections.append(question.strip())
    prompt_sections.append(
        "\nAnswer the question using only the context provided above. "
        "If the answer cannot be found, respond with: "
        '"I couldn\'t find this information in the college knowledge base."'
    )

    return "\n\n".join(prompt_sections)

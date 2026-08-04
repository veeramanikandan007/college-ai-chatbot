import io
import sys
import contextlib
from langchain_core.tools import tool
from app.core.logging import get_logger

logger = get_logger(__name__)

@tool
def execute_python(code: str) -> str:
    """
    Executes Python code in a sandboxed local environment and returns the stdout or error.
    Use this for coding queries, generating Python logic, or testing scripts.
    Provide pure Python code as input.
    """
    logger.info("Executing Python code via tool.")
    
    # Capture standard output
    output = io.StringIO()
    try:
        with contextlib.redirect_stdout(output):
            # Sandbox dict to prevent polluting global scope
            exec_globals = {}
            exec(code, exec_globals)
        result = output.getvalue()
        if not result:
            return "Code executed successfully. No output."
        return result
    except Exception as e:
        error_msg = f"Execution failed: {e}"
        logger.warning(error_msg)
        return error_msg

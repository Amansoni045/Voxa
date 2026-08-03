import time
from typing import Callable, Any

def retry_with_exponential_backoff(
    func: Callable[[], Any],
    retriable_exceptions: tuple,
    max_retries: int = 3,
    initial_delay: float = 1.0,
    on_retry: Callable[[Exception, int, float], None] = None
) -> Any:
    delay = initial_delay
    for attempt in range(1, max_retries + 1):
        try:
            return func()
        except retriable_exceptions as e:
            if attempt < max_retries:
                if on_retry:
                    on_retry(e, attempt, delay)
                time.sleep(delay)
                delay *= 2.0
            else:
                raise e

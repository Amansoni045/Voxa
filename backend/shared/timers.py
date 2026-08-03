import time
from typing import Callable, Tuple, Any

def time_execution(func: Callable, *args, **kwargs) -> Tuple[Any, float]:
    start_time = time.time()
    result = func(*args, **kwargs)
    duration = time.time() - start_time
    return result, duration

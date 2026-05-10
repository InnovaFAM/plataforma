from typing import Callable, Literal, TypedDict


class DeleteDependencyRule(TypedDict):
    checker: Callable[..., int]
    target: str
    search_key: str
    value_source: Literal["item_sk", "item_hash"]
    error_message: str

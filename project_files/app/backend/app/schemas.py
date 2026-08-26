import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=256)


class PublicPassCreate(BaseModel):
    vehicle_number: str = Field(min_length=2, max_length=24)
    phone_number: str = Field(min_length=1, max_length=40)

    @field_validator("vehicle_number")
    @classmethod
    def normalize_vehicle_number(cls, value: str) -> str:
        normalized = re.sub(r"\s+", " ", value.strip()).upper()
        if not 2 <= len(normalized) <= 24:
            raise ValueError("Номер должен содержать от 2 до 24 символов")
        if not all(char.isalnum() or char in {" ", "-"} for char in normalized):
            raise ValueError("Допустимы буквы, цифры, пробел и дефис")
        return normalized

    @field_validator("phone_number")
    @classmethod
    def normalize_phone_number(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Введите номер телефона")
        if not re.fullmatch(r"[0-9+().\s-]+", normalized):
            raise ValueError("Телефон может содержать цифры, пробелы, скобки, дефис и +")
        digits = re.sub(r"\D", "", normalized)
        if not 7 <= len(digits) <= 15:
            raise ValueError("Телефон должен содержать от 7 до 15 цифр")
        return f"+{digits}" if normalized.startswith("+") else digits


class VisibilityUpdate(BaseModel):
    hidden: bool


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=8, max_length=256)
    role: Literal["logist", "admin"]

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.fullmatch(r"[a-z0-9._-]+", normalized):
            raise ValueError("Логин: латинские буквы, цифры, точка, дефис или подчёркивание")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not any(char.isalpha() for char in value):
            raise ValueError("Пароль должен содержать букву")
        if not any(char.isdigit() for char in value):
            raise ValueError("Пароль должен содержать цифру")
        if not any(not char.isalnum() for char in value):
            raise ValueError("Пароль должен содержать специальный символ")
        return value


class UserActivationUpdate(BaseModel):
    active: bool


class UserView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    role: str
    is_active: bool
    created_at: datetime


class PassView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_number: str
    phone_number: str | None
    submitted_at: datetime
    is_hidden: bool
    hidden_at: datetime | None
    hidden_by_user_id: int | None
    restored_at: datetime | None


class PageMeta(BaseModel):
    page: int
    page_size: int
    total: int
    pages: int
    sort: str


class PassPage(BaseModel):
    items: list[PassView]
    meta: PageMeta

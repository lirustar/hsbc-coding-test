# Property Value Estimator - Python Backend

A FastAPI-based backend service that integrates with a downstream housing price prediction API (CatBoost model), providing property value estimation capabilities.

## Features

- Single house price prediction
- Batch house price prediction
- Model information query
- Input validation with detailed error messages
- Integration with downstream prediction service via HTTP

## Tech Stack

- **Framework**: FastAPI 0.115.0
- **HTTP Client**: httpx 0.27.2
- **Server**: Uvicorn 0.30.6
- **Python**: 3.13+

## Project Structure

```
property-value-estimator-python-backend/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI application entry point
│   ├── schemas.py             # Pydantic data models
│   └── prediction_client.py   # Downstream prediction service client
├── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.13 or higher
- Downstream prediction service running on `http://localhost:8000`

### Installation

1. Create virtual environment:
```bash
python -m venv .venv
```

2. Activate virtual environment:
```bash
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Server

```bash
python -m app.main
```

The server will start on port **8002**. Access the Swagger UI at: `http://localhost:8002/docs`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/health` | Health check |
| POST | `/predict` | Predict price for a single house |
| POST | `/predict/batch` | Predict prices for multiple houses |
| GET | `/model-info` | Query model information |

### Request Example

**POST /predict**

```json
{
  "square_footage": 1550,
  "bedrooms": 3,
  "bathrooms": 2.0,
  "year_built": 1997,
  "lot_size": 6800,
  "distance_to_city_center": 4.1,
  "school_rating": 7.6
}
```

### Input Validation Rules

| Field | Type | Constraints |
|-------|------|-------------|
| square_footage | float | > 0, ≤ 100,000 |
| bedrooms | int | > 0, ≤ 20 |
| bathrooms | float | > 0, ≤ 20 |
| year_built | int | 1800 ~ current year |
| lot_size | float | > 0, ≤ 1,000,000 |
| distance_to_city_center | float | ≥ 0, ≤ 500 |
| school_rating | float | 1 ~ 10 |

---

# 房产价值估算器 - Python 后端

基于 FastAPI 的后端服务，集成下游房价预测 API（CatBoost 模型），提供房产价值估算能力。

## 功能特性

- 单套房屋价格预测
- 批量房屋价格预测
- 模型信息查询
- 输入数据验证与详细错误提示
- 通过 HTTP 集成下游预测服务

## 技术栈

- **框架**: FastAPI 0.115.0
- **HTTP 客户端**: httpx 0.27.2
- **服务器**: Uvicorn 0.30.6
- **Python**: 3.13+

## 项目结构

```
property-value-estimator-python-backend/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI 应用入口
│   ├── schemas.py             # Pydantic 数据模型
│   └── prediction_client.py   # 下游预测服务客户端
├── requirements.txt
└── README.md
```

## 快速开始

### 前置条件

- Python 3.13 或更高版本
- 下游预测服务运行在 `http://localhost:8000`

### 安装步骤

1. 创建虚拟环境：
```bash
python -m venv .venv
```

2. 激活虚拟环境：
```bash
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

3. 安装依赖：
```bash
pip install -r requirements.txt
```

### 启动服务

```bash
python -m app.main
```

服务将在 **8002** 端口启动。访问 Swagger 文档：`http://localhost:8002/docs`

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 服务信息 |
| GET | `/health` | 健康检查 |
| POST | `/predict` | 单套房屋价格预测 |
| POST | `/predict/batch` | 批量房屋价格预测 |
| GET | `/model-info` | 查询模型信息 |

### 请求示例

**POST /predict**

```json
{
  "square_footage": 1550,
  "bedrooms": 3,
  "bathrooms": 2.0,
  "year_built": 1997,
  "lot_size": 6800,
  "distance_to_city_center": 4.1,
  "school_rating": 7.6
}
```

### 输入验证规则

| 字段 | 类型 | 约束条件 |
|------|------|----------|
| square_footage | float | > 0, ≤ 100,000 |
| bedrooms | int | > 0, ≤ 20 |
| bathrooms | float | > 0, ≤ 20 |
| year_built | int | 1800 ~ 当前年份 |
| lot_size | float | > 0, ≤ 1,000,000 |
| distance_to_city_center | float | ≥ 0, ≤ 500 |
| school_rating | float | 1 ~ 10 |

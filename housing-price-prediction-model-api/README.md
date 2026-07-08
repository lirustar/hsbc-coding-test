# Housing Price Prediction Model API

[中文](#中文文档) | **English**

---

## English

A housing price prediction service powered by **CatBoost**, with a **FastAPI** RESTful API supporting single and batch property price predictions.

### Project Structure

```
housing-price-prediction-model-api/
├── main.py                      # FastAPI service entry point
├── feature_engineering.py       # Feature engineering module
├── train_catboost.py            # CatBoost training script
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Docker build file
├── .dockerignore                # Docker ignore file
├── model/
│   ├── catboost_model.cbm       # Trained CatBoost model
│   └── model_info.json          # Model metadata (evaluation, feature importance)
├── House Price Dataset.csv      # Training dataset (50 records)
└── Test Data For Prediction.csv # Test dataset (10 records)
```

### Tech Stack

| Component    | Technology        |
|--------------|-------------------|
| Model        | CatBoost 1.2.10   |
| Framework    | FastAPI 0.138.1   |
| Server       | Uvicorn 0.49.0    |
| Data Process | Pandas 3.0.4      |
| ML           | Scikit-learn 1.9.0 |

### Feature Engineering

**Original Features (7):** `square_footage`, `bedrooms`, `bathrooms`, `year_built`, `lot_size`, `distance_to_city_center`, `school_rating`

**Derived Features (11):** `house_age`, `sqft_per_bedroom`, `sqft_per_bathroom`, `total_rooms`, `lot_to_house_ratio`, `school_distance_interaction`, `bedroom_ratio`, `is_new_house`, `size_category`, `age_category`, `distance_category`

### Model Evaluation

| Metric | Result   |
|--------|----------|
| MAE    | 5,482.51 |
| RMSE   | 6,458.50 |
| R²     | 0.9925   |

### Quick Start

**Local:**

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python train_catboost.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Docker:**

```bash
docker build -t housing-price-api .
docker run -p 8000:8000 --name housing-price-api housing-price-api
```

### API Endpoints

| Method | Path            | Description                  |
|--------|-----------------|------------------------------|
| GET    | `/`             | Health check                 |
| POST   | `/predict`      | Single house price prediction |
| POST   | `/predict/batch`| Batch house price predictions (min 3) |
| GET    | `/model-info`   | Query model information      |

Visit `http://localhost:8000/docs` for interactive Swagger UI.

---

## 中文文档

基于 **CatBoost** 的房价预测服务，使用 **FastAPI** 构建 RESTful API，支持单套及批量房源价格预测。

## 项目结构

```
housing-price-prediction-model-api/
├── main.py                      # FastAPI 服务入口
├── feature_engineering.py       # 特征工程模块
├── train_catboost.py            # CatBoost 训练脚本
├── requirements.txt             # Python 依赖
├── Dockerfile                   # Docker 构建文件
├── .dockerignore                # Docker 忽略文件
├── model/
│   ├── catboost_model.cbm       # 训练好的 CatBoost 模型
│   └── model_info.json          # 模型元信息（评估结果、特征重要性等）
├── House Price Dataset.csv      # 训练数据集（50 条）
└── Test Data For Prediction.csv # 测试数据集（10 条）
```

## 技术栈

| 组件     | 技术选型          |
|----------|-------------------|
| 模型     | CatBoost 1.2.10   |
| 框架     | FastAPI 0.138.1   |
| 服务器   | Uvicorn 0.49.0    |
| 数据处理 | Pandas 3.0.4      |
| 机器学习 | Scikit-learn 1.9.0 |

## 特征工程

### 原始特征（7 个）

| 特征                      | 说明               |
|---------------------------|--------------------|
| `square_footage`          | 房屋面积（平方英尺）|
| `bedrooms`                | 卧室数量           |
| `bathrooms`               | 浴室数量           |
| `year_built`              | 建造年份           |
| `lot_size`                | 地块面积（平方英尺）|
| `distance_to_city_center` | 距市中心距离（英里）|
| `school_rating`           | 学区评分（1-10）   |

### 衍生特征（11 个）

| 特征                         | 说明                         |
|------------------------------|------------------------------|
| `house_age`                  | 房龄                         |
| `sqft_per_bedroom`           | 每间卧室平均面积             |
| `sqft_per_bathroom`          | 每间浴室平均面积             |
| `total_rooms`                | 总房间数                     |
| `lot_to_house_ratio`         | 地块/房屋面积比              |
| `school_distance_interaction`| 学区评分 × 距市中心距离      |
| `bedroom_ratio`              | 卧室占总房间比例             |
| `is_new_house`               | 是否新房（2000 年后建造）    |
| `size_category`              | 面积分段（small/medium/large）|
| `age_category`               | 房龄分段（new/mid/old）      |
| `distance_category`          | 距离分段（close/mid/far）    |

## 模型评估

| 指标  | 结果     |
|-------|----------|
| MAE   | 5,482.51 |
| RMSE  | 6,458.50 |
| R²    | 0.9925   |

### 特征重要性 Top 5

1. `bedrooms` — 18.40
2. `size_category` — 13.15
3. `distance_to_city_center` — 9.31
4. `house_age` — 8.89
5. `year_built` — 8.81

## 快速开始

### 本地运行

```bash
# 1. 创建虚拟环境
python -m venv .venv
.venv\Scripts\activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 训练模型（生成 model/ 目录下的文件）
python train_catboost.py

# 4. 启动 API 服务
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Docker 运行

```bash
# 构建镜像
docker build -t housing-price-api .

# 运行容器
docker run -p 8000:8000 housing-price-api
```

## API 接口

启动后访问 `http://localhost:8000/docs` 查看 Swagger 交互式文档。

### 健康检查

```
GET /
```

### 单套房源预测

```
POST /predict
Content-Type: application/json

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

**响应：**

```json
{
  "predicted_price": 239479.02,
  "input": { ... }
}
```

### 批量房源预测

```
POST /predict/batch
Content-Type: application/json

{
  "houses": [
    { "square_footage": 1550, "bedrooms": 3, "bathrooms": 2.0, "year_built": 1997, "lot_size": 6800, "distance_to_city_center": 4.1, "school_rating": 7.6 },
    { "square_footage": 2200, "bedrooms": 4, "bathrooms": 2.5, "year_built": 2008, "lot_size": 9600, "distance_to_city_center": 7.0, "school_rating": 8.8 },
    { "square_footage": 2300, "bedrooms": 4, "bathrooms": 3.0, "year_built": 2013, "lot_size": 10300, "distance_to_city_center": 8.0, "school_rating": 9.2 }
  ]
}
```

### 查询模型信息

```
GET /model-info
```

返回模型名称、训练参数、评估结果及特征重要性。

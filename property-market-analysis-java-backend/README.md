# Property Market Analysis - Java Backend

A Spring Boot backend service that integrates with a housing price prediction API and provides property market analysis with aggregate statistics.

## Tech Stack

- **Java 21**
- **Spring Boot 3.4.4**
- **Maven** (via Maven Wrapper)
- **Caffeine** - Application-level caching
- **SpringDoc OpenAPI** - Swagger API documentation

## Prerequisites

- Java 21+ (JDK)
- The downstream prediction API running at `http://localhost:8000`

## Getting Started

### Build

```bash
./mvnw.cmd compile
```

### Run

```bash
./mvnw.cmd spring-boot:run
```

The application starts on port **8001**.

### Test

```bash
./mvnw.cmd test
```

### Package

```bash
./mvnw.cmd package
```

## API Documentation

After starting the application, access the Swagger UI:

- **Swagger UI**: http://localhost:8001/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8001/v3/api-docs

## API Endpoints

### Prediction API (proxied to downstream service)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health check |
| POST | `/api/predict` | Predict price for a single house |
| POST | `/api/predict/batch` | Predict prices for multiple houses (min 3) |
| GET | `/api/model-info` | Get model information |

### Market Analysis API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/market/properties` | Get all housing records |
| GET | `/api/market/properties/table` | Query with filtering, sorting & pagination |
| GET | `/api/market/statistics` | Overall aggregate statistics |
| GET | `/api/market/statistics/by-bedroom` | Statistics grouped by bedrooms |
| GET | `/api/market/statistics/by-distance` | Statistics grouped by distance to city center |
| GET | `/api/market/statistics/by-school-rating` | Statistics grouped by school rating |
| GET | `/api/market/statistics/by-year` | Statistics grouped by year built |
| GET | `/api/market/top-expensive?limit=10` | Top N most expensive properties |
| GET | `/api/market/top-affordable?limit=10` | Top N most affordable properties |

### Data Table Query Parameters

`GET /api/market/properties/table` supports:

**Filters:** `bedrooms`, `minPrice`, `maxPrice`, `minSquareFootage`, `maxSquareFootage`, `minYearBuilt`, `maxYearBuilt`, `minDistance`, `maxDistance`, `minSchoolRating`, `maxSchoolRating`

**Sorting:** `sortBy` (price, squareFootage, bedrooms, bathrooms, yearBuilt, lotSize, distanceToCityCenter, schoolRating), `sortOrder` (asc/desc)

**Pagination:** `page` (0-based), `size` (default 10)

**Example:**
```
GET /api/market/properties/table?bedrooms=3&minPrice=200000&sortBy=price&sortOrder=desc&page=0&size=5
```

## Caching

The `/api/predict` endpoint uses Caffeine cache with a **10-minute TTL**. Identical requests within 10 minutes are served from cache without calling the downstream API.

## Configuration

| Property | Default | Description |
|----------|---------|-------------|
| `server.port` | `8001` | Application port |
| `prediction.api.base-url` | `http://localhost:8000` | Downstream prediction API URL |

## Project Structure

```
src/main/java/com/hsbc/propertymarketanalysis/
├── PropertyMarketAnalysisApplication.java   # Main entry point
├── client/
│   └── PredictionApiClient.java             # Downstream API client
├── config/
│   ├── CacheConfig.java                     # Caffeine cache configuration
│   ├── RestClientConfig.java                # RestClient bean
│   └── SwaggerConfig.java                   # OpenAPI/Swagger configuration
├── controller/
│   ├── MarketAnalysisController.java        # Market analysis endpoints
│   └── PredictionController.java            # Prediction endpoints
├── dto/
│   ├── BatchInput.java                      # Batch prediction input
│   ├── BatchResult.java                     # Batch prediction result
│   ├── HouseInput.java                      # Single house input
│   ├── HousingRecord.java                   # CSV housing record
│   ├── PagedResult.java                     # Paginated response
│   ├── PredictionResult.java                # Single prediction result
│   └── PropertyTableQuery.java              # Table query parameters
└── service/
    ├── MarketAnalysisService.java           # Market analysis logic
    └── PredictionService.java               # Prediction service with caching
```

---

# 房产市场分析 - Java 后端

基于 Spring Boot 的后端服务，集成房价预测 API 并提供房产市场聚合统计分析。

## 技术栈

- **Java 21**
- **Spring Boot 3.4.4**
- **Maven**（通过 Maven Wrapper）
- **Caffeine** - 应用级缓存
- **SpringDoc OpenAPI** - Swagger 接口文档

## 前置条件

- Java 21+（JDK）
- 下游预测 API 运行在 `http://localhost:8000`

## 快速开始

### 编译

```bash
./mvnw.cmd compile
```

### 运行

```bash
./mvnw.cmd spring-boot:run
```

应用启动在 **8001** 端口。

### 测试

```bash
./mvnw.cmd test
```

### 打包

```bash
./mvnw.cmd package
```

## 接口文档

启动应用后访问 Swagger UI：

- **Swagger UI**: http://localhost:8001/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8001/v3/api-docs

## API 接口列表

### 预测接口（代理下游服务）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 服务健康检查 |
| POST | `/api/predict` | 单个房价预测 |
| POST | `/api/predict/batch` | 批量房价预测（最少3套） |
| GET | `/api/model-info` | 获取模型信息 |

### 市场分析接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/market/properties` | 获取所有房产记录 |
| GET | `/api/market/properties/table` | 支持过滤、排序、分页的查询 |
| GET | `/api/market/statistics` | 整体聚合统计 |
| GET | `/api/market/statistics/by-bedroom` | 按卧室数量分组统计 |
| GET | `/api/market/statistics/by-distance` | 按距市中心距离分组统计 |
| GET | `/api/market/statistics/by-school-rating` | 按学校评分分组统计 |
| GET | `/api/market/statistics/by-year` | 按建造年份分组统计 |
| GET | `/api/market/top-expensive?limit=10` | 最贵的 N 套房产 |
| GET | `/api/market/top-affordable?limit=10` | 最实惠的 N 套房产 |

### 数据表格查询参数

`GET /api/market/properties/table` 支持：

**过滤器：** `bedrooms`、`minPrice`、`maxPrice`、`minSquareFootage`、`maxSquareFootage`、`minYearBuilt`、`maxYearBuilt`、`minDistance`、`maxDistance`、`minSchoolRating`、`maxSchoolRating`

**排序：** `sortBy`（price、squareFootage、bedrooms、bathrooms、yearBuilt、lotSize、distanceToCityCenter、schoolRating），`sortOrder`（asc/desc）

**分页：** `page`（0起始），`size`（默认10）

**示例：**
```
GET /api/market/properties/table?bedrooms=3&minPrice=200000&sortBy=price&sortOrder=desc&page=0&size=5
```

## 缓存机制

`/api/predict` 接口使用 Caffeine 缓存，**过期时间 10 分钟**。相同参数请求在 10 分钟内直接从缓存返回，不再调用下游 API。

## 配置项

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `server.port` | `8001` | 应用端口 |
| `prediction.api.base-url` | `http://localhost:8000` | 下游预测 API 地址 |

## 项目结构

```
src/main/java/com/hsbc/propertymarketanalysis/
├── PropertyMarketAnalysisApplication.java   # 主启动类
├── client/
│   └── PredictionApiClient.java             # 下游API客户端
├── config/
│   ├── CacheConfig.java                     # Caffeine缓存配置
│   ├── RestClientConfig.java                # RestClient配置
│   └── SwaggerConfig.java                   # OpenAPI/Swagger配置
├── controller/
│   ├── MarketAnalysisController.java        # 市场分析接口
│   └── PredictionController.java            # 预测接口
├── dto/
│   ├── BatchInput.java                      # 批量预测输入
│   ├── BatchResult.java                     # 批量预测结果
│   ├── HouseInput.java                      # 单个房屋输入
│   ├── HousingRecord.java                   # CSV房产记录
│   ├── PagedResult.java                     # 分页响应
│   ├── PredictionResult.java                # 单个预测结果
│   └── PropertyTableQuery.java              # 表格查询参数
└── service/
    ├── MarketAnalysisService.java           # 市场分析业务逻辑
    └── PredictionService.java               # 预测服务（含缓存）
```

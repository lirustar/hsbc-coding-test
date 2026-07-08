# Property Solutions Portal

A multi-application Next.js portal providing property valuation and market analysis tools, powered by machine learning backend services.

---

## 🚀 Features

### 🏠 Portal Home (`/`)
- Landing page with quick access to all applications
- Responsive card-based navigation

### 💰 Property Value Estimator (`/property-value-estimator`)
- Input 7 property features (square footage, bedrooms, bathrooms, year built, lot size, distance to city, school rating)
- Get instant price predictions via ML model
- Visualize results with bar charts and radar charts
- Toggle between table view and chart view with dataset-relative scoring (0–100)
- Client-side form validation with range constraints

### 📜 Estimation History (`/property-value-estimator/history`)
- View all past predictions stored in localStorage
- Compare multiple predictions side-by-side
- Radar chart overlay for visual comparison
- Persistent history across sessions

### 📊 Property Market Analysis (`/property-market-analysis`)
- **Stats Cards**: Total properties, median price, avg square footage, avg lot size, avg distance, avg school rating — each with min-max range
- **Property Data Table**: Full-field sortable table with filtering (bedrooms, price, sq ft, school rating), pagination
- **What-If Analysis**: Select any property row, adjust features, and predict price using the ML model — compare predicted vs actual price with difference indicator
- **Charts**: Avg price by bedrooms, avg price by distance, price by school rating, property count by bedrooms
- **Rankings**: Top 5 most expensive and most affordable properties
- **Export**: Download table data as CSV or export the full dashboard as PDF

---

## 🛠️ Tech Stack

| Category        | Technology                |
| --------------- | ------------------------- |
| Framework       | Next.js 16 (App Router)   |
| UI Library      | React 19                  |
| Styling         | Tailwind CSS 4            |
| Charts          | Recharts 3                |
| PDF Export      | jsPDF + html-to-image     |
| Language        | TypeScript 5              |
| Fonts           | Geist Sans + Geist Mono   |

---

## 📁 Project Structure

```
src/app/
├── page.tsx                                    # Portal home page
├── layout.tsx                                  # Root layout (TopNav, SkipLink, Providers)
├── globals.css                                 # Global styles
├── error.tsx                                   # Root error boundary
├── loading.tsx                                 # Root loading UI
│
├── property-value-estimator/
│   ├── layout.tsx                              # Sidebar layout (Estimator / History nav)
│   ├── page.tsx                                # Estimator form + prediction result
│   ├── loading.tsx                             # Estimator loading UI
│   └── history/
│       ├── page.tsx                            # Prediction history + comparison
│       └── loading.tsx                         # History loading UI
│
├── property-market-analysis/
│   ├── page.tsx                                # Market dashboard + what-if analysis
│   ├── error.tsx                               # Market analysis error boundary
│   └── loading.tsx                             # Market analysis loading UI
│
├── api/
│   ├── property-value-estimator/
│   │   └── predict/
│   │       └── route.ts                        # Proxy → http://127.0.0.1:8002/predict
│   └── property-market-analysis/
│       └── [...path]/
│           └── route.ts                        # Proxy → http://127.0.0.1:8001/[...path]
│
└── components/
    ├── TopNav.tsx                              # Top navigation bar
    ├── SkipLink.tsx                            # WCAG skip-to-content link
    ├── Providers.tsx                           # Context providers wrapper
    ├── ErrorBoundary.tsx                       # Error boundary component
    ├── LoadingSpinner.tsx                      # Loading spinner
    └── Skeleton.tsx                            # Skeleton loading placeholder
```

---

## 🔌 Backend Services

| Service                 | Address                 | Purpose                          |
| ----------------------- | ----------------------- | -------------------------------- |
| Property Valuation API  | `http://127.0.0.1:8002` | ML prediction (POST /predict)    |
| Market Analysis API     | `http://127.0.0.1:8001` | Statistics, properties, predict  |

### API Proxy Routes

All backend calls are proxied through Next.js API routes to avoid CORS issues:

| Frontend Route                                          | Backend Target                                      |
| ------------------------------------------------------- | --------------------------------------------------- |
| `POST /api/property-value-estimator/predict`            | `POST http://127.0.0.1:8002/predict`                |
| `GET/POST/PUT/PATCH/DELETE /api/property-market-analysis/*` | `http://127.0.0.1:8001/*` (catch-all)         |

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: Make sure the backend services are running before using the applications.

### Build

```bash
npm run build
npm start
```

---

## 🐳 Docker

### Build Image

```bash
docker build -t property-solutions-portal .
```

### Run Container

```bash
docker run -d \
  --name property-portal \
  -p 3000:3000 \
  -e PROPERTY_VALUATION_API_URL=http://host.docker.internal:8002 \
  -e MARKET_ANALYSIS_API_URL=http://host.docker.internal:8001 \
  property-solutions-portal
```

### Environment Variables

| Variable                      | Default                                  | Description              |
| ----------------------------- | ---------------------------------------- | ------------------------ |
| `PORT`                        | `3000`                                   | Container listening port |
| `HOSTNAME`                    | `0.0.0.0`                                | Bind address             |
| `PROPERTY_VALUATION_API_URL`  | `http://host.docker.internal:8002`       | Property Valuation API   |
| `MARKET_ANALYSIS_API_URL`     | `http://host.docker.internal:8001`       | Market Analysis API      |

> **Note**: `host.docker.internal` resolves to the host machine's IP, allowing the container to access backend services running on the host. On Linux, add `--add-host=host.docker.internal:host-gateway` to the `docker run` command.

### Multi-Stage Build

The Dockerfile uses a 3-stage build for optimized image size:

| Stage    | Base Image       | Purpose                        |
| -------- | ---------------- | ------------------------------ |
| `deps`   | `node:22-alpine` | Install dependencies           |
| `builder`| `node:22-alpine` | Build Next.js application      |
| `runner` | `node:22-alpine` | Production runtime (minimal)   |

---

## ♿ Accessibility

- WCAG 2.1 compliant skip-to-content link
- ARIA labels and roles throughout
- Keyboard-navigable interactive elements
- Focus ring indicators on all interactive components
- Semantic HTML structure

---

## 📄 License

© 2026 Property Solutions Portal. All rights reserved.

---

# Property Solutions Portal（中文）

基于 Next.js 的多应用门户系统，提供房产估值和市场分析工具，由机器学习后端服务驱动。

---

## 🚀 功能特性

### 🏠 门户首页 (`/`)
- 所有应用的快速入口
- 响应式卡片导航布局

### 💰 房产估值工具 (`/property-value-estimator`)
- 输入 7 个房产特征（面积、卧室数、浴室数、建造年份、地块大小、距市中心距离、学校评分）
- 通过 ML 模型即时获取价格预测
- 柱状图和雷达图可视化展示结果
- 支持表格视图和图表视图切换，含数据集相对评分（0–100）
- 客户端表单验证，带范围约束

### 📜 历史记录 (`/property-value-estimator/history`)
- 查看存储在 localStorage 中的所有历史预测
- 并排比较多个预测结果
- 雷达图叠加对比可视化
- 跨会话持久化历史记录

### 📊 房产市场分析 (`/property-market-analysis`)
- **统计卡片**：总房产数、中位价格、平均面积、平均地块大小、平均距离、平均学校评分 — 每张卡片显示最小-最大范围
- **房产数据表格**：全字段可排序表格，支持筛选（卧室、价格、面积、学校评分）、分页
- **What-If 分析**：选择任意房产行，调整特征参数，使用 ML 模型预测价格 — 对比预测价格与实际价格，显示差异指标
- **图表**：按卧室数平均价格、按距离平均价格、按学校评分价格、按卧室数房产数量
- **排行榜**：最贵和最便宜的前 5 处房产
- **导出**：支持将表格数据导出为 CSV，或将完整仪表盘导出为 PDF

---

## 🛠️ 技术栈

| 类别     | 技术                       |
| -------- | -------------------------- |
| 框架     | Next.js 16 (App Router)    |
| UI 库    | React 19                   |
| 样式     | Tailwind CSS 4             |
| 图表     | Recharts 3                 |
| PDF 导出 | jsPDF + html-to-image      |
| 语言     | TypeScript 5               |
| 字体     | Geist Sans + Geist Mono    |

---

## 🔌 后端服务

| 服务         | 地址                      | 用途                             |
| ------------ | ------------------------- | -------------------------------- |
| 房产估值 API | `http://127.0.0.1:8002`   | ML 预测 (POST /predict)          |
| 市场分析 API | `http://127.0.0.1:8001`   | 统计数据、房产列表、预测         |

### API 代理路由

所有后端调用通过 Next.js API 路由代理，避免 CORS 问题：

| 前端路由                                                | 后端目标                                            |
| ------------------------------------------------------- | --------------------------------------------------- |
| `POST /api/property-value-estimator/predict`            | `POST http://127.0.0.1:8002/predict`                |
| `GET/POST/PUT/PATCH/DELETE /api/property-market-analysis/*` | `http://127.0.0.1:8001/*`（catch-all）    |

---

## ⚡ 快速开始

### 前置条件

- Node.js 18+
- npm 9+

### 安装

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

> **注意**：使用各应用前请确保后端服务已启动。

### 构建

```bash
npm run build
npm start
```

---

## 🐳 Docker

### 构建镜像

```bash
docker build -t property-solutions-portal .
```

### 运行容器

```bash
docker run -d \
  --name property-portal \
  -p 3000:3000 \
  -e PROPERTY_VALUATION_API_URL=http://host.docker.internal:8002 \
  -e MARKET_ANALYSIS_API_URL=http://host.docker.internal:8001 \
  property-solutions-portal
```

### 环境变量

| 变量                          | 默认值                                   | 说明                 |
| ----------------------------- | ---------------------------------------- | -------------------- |
| `PORT`                        | `3000`                                   | 容器监听端口         |
| `HOSTNAME`                    | `0.0.0.0`                                | 绑定地址             |
| `PROPERTY_VALUATION_API_URL`  | `http://host.docker.internal:8002`       | 房产估值 API 地址    |
| `MARKET_ANALYSIS_API_URL`     | `http://host.docker.internal:8001`       | 市场分析 API 地址    |

> **注意**：`host.docker.internal` 会解析为宿主机的 IP 地址，允许容器访问运行在宿主机上的后端服务。在 Linux 上需添加 `--add-host=host.docker.internal:host-gateway` 参数。

### 多阶段构建

Dockerfile 使用 3 阶段构建以优化镜像大小：

| 阶段     | 基础镜像         | 用途                         |
| -------- | ---------------- | ---------------------------- |
| `deps`   | `node:22-alpine` | 安装依赖                     |
| `builder`| `node:22-alpine` | 构建 Next.js 应用            |
| `runner` | `node:22-alpine` | 生产运行环境（最小化镜像）   |

---

## ♿ 无障碍支持

- 符合 WCAG 2.1 标准的跳过导航链接
- 全局 ARIA 标签和角色
- 可键盘导航的交互元素
- 所有交互组件的焦点环指示器
- 语义化 HTML 结构

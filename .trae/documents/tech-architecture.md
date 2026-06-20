## 1. 架构设计

```mermaid
flowchart TD
    "前端 React 应用" --> "Zustand 状态管理"
    "Zustand 状态管理" --> "LocalStorage 持久化"
    "前端 React 应用" --> "HTML2Canvas 导出"
    "前端 React 应用" --> "DnD Kit 拖拽引擎"
```

纯前端架构，无需后端服务。数据通过 LocalStorage 持久化，拖拽使用 @dnd-kit 库，导出使用 html2canvas。

## 2. 技术说明

- 前端：React@18 + TypeScript + Tailwind CSS@3 + Vite
- 初始化工具：vite-init (react-ts 模板)
- 状态管理：Zustand (含 persist 中间件自动持久化到 LocalStorage)
- 拖拽：@dnd-kit/core + @dnd-kit/sortable
- 导出图片：html2canvas
- 图标：lucide-react
- 后端：无
- 数据库：无（使用 LocalStorage）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 排期白板主页（唯一页面） |

## 4. API 定义

不适用（纯前端，无后端 API）

## 5. 服务端架构图

不适用

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    "Session" ||--o{ "SessionSlot" : "contains"
    "Player" ||--o{ "SessionSlot" : "assigned_to"
    "Player" ||--o{ "PlayRecord" : "has"

    "Session" {
        "string id PK"
        "string scriptName"
        "string playerStructure"
        "number estimatedDuration"
        "string dmName"
        "string shopName"
        "string depositStatus"
        "string weekKey"
        "number createdAt"
    }

    "SessionSlot" {
        "string id PK"
        "string sessionId FK"
        "string playerId FK"
        "string slotLabel"
        "string requiredGender"
        "number slotIndex"
    }

    "Player" {
        "string id PK"
        "string nickname"
        "string[] preferenceTypes"
        "boolean canStayUp"
        "boolean acceptCrossGender"
        "string lateNote"
        "string[] availableTimeSlots"
    }

    "PlayRecord" {
        "string id PK"
        "string playerId FK"
        "string scriptName"
        "string scriptType"
        "string shopName"
        "number playedAt"
    }
```

### 6.2 数据定义语言

使用 TypeScript 接口定义：

```typescript
interface Session {
  id: string
  scriptName: string
  playerStructure: string
  estimatedDuration: number
  dmName: string
  shopName: string
  depositStatus: 'paid' | 'unpaid' | 'partial'
  weekKey: string
  createdAt: number
}

interface SessionSlot {
  id: string
  sessionId: string
  playerId: string | null
  slotLabel: string
  requiredGender: 'male' | 'female' | 'any'
  slotIndex: number
}

interface Player {
  id: string
  nickname: string
  preferenceTypes: string[]
  canStayUp: boolean
  acceptCrossGender: boolean
  lateNote: string
  availableTimeSlots: string[]
}

interface PlayRecord {
  id: string
  playerId: string
  scriptName: string
  scriptType: string
  shopName: string
  playedAt: number
}
```

Zustand Store 结构：

```typescript
interface ScheduleStore {
  sessions: Session[]
  sessionSlots: SessionSlot[]
  players: Player[]
  playRecords: PlayRecord[]
  currentWeekKey: string

  addSession: (session: Omit<Session, 'id' | 'createdAt'>) => void
  updateSession: (id: string, data: Partial<Session>) => void
  deleteSession: (id: string) => void

  addSlot: (slot: Omit<SessionSlot, 'id'>) => void
  assignPlayer: (slotId: string, playerId: string | null) => void

  addPlayer: (player: Omit<Player, 'id'>) => void
  updatePlayer: (id: string, data: Partial<Player>) => void
  deletePlayer: (id: string) => void

  addPlayRecord: (record: Omit<PlayRecord, 'id'>) => void
  deletePlayRecord: (id: string) => void

  getHints: (playerId: string, sessionId: string) => Hint[]
}
```

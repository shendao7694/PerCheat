# PerCheat

> **警告**：这是一个 Box3 作弊程序的开源代码。本程序可使用的 Box3 平台已经关服，因此开源 PerCheat 代码。

## 免责声明

**请在使用或传播本项目前仔细阅读以下内容：**

1. **仅供学习交流**：本项目开源的目的仅为技术研究与学习交流（如逆向工程、游戏客户端架构、UI 框架设计等），**严禁**将本项目或其衍生代码用于任何商业用途、破坏游戏公平性的行为，或违反相关法律法规及平台用户协议的场景。
2. **平台已关服**：本项目所针对的 Box3 平台已经停止服务，代码不再具备实际运行环境。作者开源此项目**不代表**支持、鼓励或认可任何形式的作弊行为。
3. **无担保责任**：本项目按「现状」（AS-IS）提供，作者不对代码的完整性、安全性、可用性作任何明示或暗示的担保。因使用、修改、分发本项目而产生的任何直接或间接损失、法律责任、第三方纠纷，**均由使用者自行承担**，作者不承担任何责任。
4. **合规使用**：使用者应自行确保其行为符合所在地区的法律法规以及相关平台的服务条款。若将本项目的技术思路应用于其他在线游戏，可能构成违约甚至违法，请务必谨慎。
5. **版权与归属**：项目中涉及的第三方库、商标、游戏资源等归其各自权利人所有。如有侵权，请联系作者删除。
6. **最终解释权**：作者保留对本免责声明的最终解释权，并有权随时更新。继续使用本项目即视为您已阅读、理解并同意本声明全部内容。

> **若您不同意上述任何条款，请立即停止使用并删除本项目全部代码。**

## 快速开始

### 环境要求

- Node.js（建议使用 LTS 版本）
- npm

### 安装依赖

```bash
npm install
```

### 构建源代码

```bash
npm run build
```

### 开启开发栈

```bash
npm run dev
```

## 项目结构

| 路径 | 说明 |
| --- | --- |
| `src/i18n` | i18n 多语言主程序 |
| `src/main` | 核心程序目录 |
| `src/main/GameCore` | PerCheat 的核心，用于抓取 Box3 实例 |
| `src/main/GameFront` | PerCheat 的一些前置 |
| `src/main/GameGUI` | PerCheat 的 UI |
| `src/main/GameModules` | PerCheat 中所有作弊模块的程序 |
| `src/sys` | 支持库程序 |

## 贡献

由于目标平台已关服，本项目主要作为归档与技术参考保留。如需提交 Issue 或 Pull Request，请确保内容与学习研究相关，并遵守上述免责声明。

## 许可证

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源。

```
MIT License

Copyright (c) 2026 shendao7694

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

**再次提醒：本项目仅供学习研究，请勿用于任何违规或违法用途。**

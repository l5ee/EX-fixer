# EX-fixer

修复中文版本ae打开英文版本ae出现的表达式错误问题。

## 使用方法

### 1. 安装脚本

将脚本文件 `EX-fixer.jsx` 放置在以下路径中：

Windows:
- `C:\Program Files\Adobe\Adobe After Effects [版本]\Support Files\Scripts\ScriptUI Panels\`
- 或 `C:\Program Files\Adobe\Adobe After Effects [版本]\Support Files\Scripts\`

macOS:
- `/Applications/Adobe After Effects [版本]/Scripts/ScriptUI Panels/`
- 或 `/Applications/Adobe After Effects [版本]/Scripts/`

注意：
- 放在 `ScriptUI Panels` 文件夹中可通过"窗口"菜单访问
- 放在 `Scripts` 文件夹中可通过"文件 -> 脚本"菜单访问
- [版本] 替换为你的 AE 版本号，如 CC 2024

### 2. 运行脚本

方式一（推荐）：
- 通过"窗口 -> EX-fixer"打开面板（需将脚本放在 ScriptUI Panels 文件夹）

方式二：
- 通过"文件 -> 脚本 -> EX-fixer.jsx"运行（需将脚本放在 Scripts 文件夹）

### 3. 使用功能

- 打开需要修复的 AE 项目
- 运行脚本后将自动扫描项目中的所有图层、属性
- 自动修复表达式错误
- 完成后会显示修复成功的表达式数量

{
    // 首先声明所有核心功能函数
    function scanPropertyGroup(propertyGroup) {
        if (!propertyGroup) return;
        
        try {
            // 如果是属性组，遍历其所有子属性
            for (var i = 1; i <= propertyGroup.numProperties || 0; i++) {
                var prop = propertyGroup.property(i);
                if (!prop) continue;
                
                // 如果是属性组，递归处理
                if (prop.propertyType === PropertyType.PROPERTY_GROUP) {
                    scanPropertyGroup(prop);
                }
                // 如果是包含表达式的属性，进行修复
                else if (prop.expression) {
                    try {
                        alert("找到表达式: " + prop.expression);
                        var expression = prop.expression;
                        
                        // 扩展替换规则，添加更多效果名称
                        var replacements = {
                            // 效果名称
                            'color control': '颜色控制',
                            'Color Control': '颜���控制',
                            'slider control': '滑块控制',
                            'Slider Control': '滑块控制',
                            'angle control': '角度控制',
                            'Angle Control': '角度控制',
                            'point control': '点控制',
                            'Point Control': '点控制',
                            'checkbox control': '复选框控制',
                            'Checkbox Control': '复选框控制',
                            
                            // 效果参数
                            'color': '颜色',
                            'Color': '颜色',
                            'Slider': '滑块',
                            'slider': '滑块',
                            'Angle': '角度',
                            'angle': '角度',
                            'Point': '点',
                            'point': '点',
                            'Checkbox': '复选框',
                            'checkbox': '复选框',
                            
                            // 常用函数和属性
                            'linear\\(': '线性(',
                            'ease\\(': '缓动(',
                            'clamp\\(': '限幅(',
                            'wiggle\\(': '摆动(',
                            'time': '时间',
                            'index': '索引',
                            'value': '数值',
                            'position': '位置',
                            'scale': '缩放',
                            'rotation': '旋转',
                            'opacity': '不透明度',
                            'sourceRectAtTime': '源矩形在时间',
                            'width': '宽度',
                            'height': '高度',
                            'anchorPoint': '锚点',
                            'transform': '变换',
                            'text': '文本',
                            'sourceText': '源文本',
                            'content': '内容',
                            
                            // 图层引用
                            'thisComp': 'thisComp',  // 保持不变
                            'layer\\(': 'layer(',    // 保持不变
                            'effect\\(': 'effect('   // 保持不变
                        };

                        // 应用所有替换
                        for (var key in replacements) {
                            var regex = new RegExp(key, 'g');
                            expression = expression.replace(regex, replacements[key]);
                        }
                        
                        // 更新表达式
                        prop.expression = expression;
                        alert("修改后的表达式: " + expression);
                        
                    } catch (err) {
                        alert("处理表达式时出错: " + err.toString());
                        continue;
                    }
                }
            }
        } catch (err) {
            alert("处理属性组时出错: " + err.toString());
        }
    }

    function scanAndFixProperties(layer) {
        if (!layer) return;
        
        try {
            // 处理变换属性组
            if (layer.transform) scanPropertyGroup(layer.transform);
            
            // 处理效果属性组
            if (layer("Effects")) scanPropertyGroup(layer("Effects"));
            
            // 处理文本属性（如果是文本图层）
            if (layer instanceof TextLayer && layer("Text")) {
                scanPropertyGroup(layer("Text"));
            }
            
            // 处理形状属性（如果是形状图层）
            if (layer instanceof ShapeLayer && layer("Contents")) {
                scanPropertyGroup(layer("Contents"));
            }
            
        } catch (err) {
            alert("处理图层属性时出错: " + err.toString());
        }
    }

    function fixExpressions() {
        try {
            // 检查 this 和 parent 是否存在
            if (!this || !this.parent) {
                alert("错误：this 或 this.parent 未定义");
                return;
            }

            var proj = app.project;
            var statusText;
            
            try {
                statusText = this.parent.parent.children[1];
            } catch (err) {
                alert("无法获取状态文本控件: " + err.toString());
                return;
            }

            function updateStatus(text) {
                if (statusText) {
                    statusText.text = text;
                }
                $.writeln(text); // 同时输出到控制台
            }
            
            if (!proj) {
                updateStatus("错误：未找到活动项目");
                return;
            }

            app.beginUndoGroup("修复表达式");

            var fixedCount = 0;
            updateStatus("开始处理项目...");

            // 遍历所有合成
            for (var i = 1; i <= proj.numItems; i++) {
                var item = proj.item(i);
                if (item instanceof CompItem) {
                    updateStatus("正在处理合成: " + item.name);
                    
                    // 遍历合成中的所有图层
                    for (var j = 1; j <= item.numLayers; j++) {
                        var layer = item.layer(j);
                        if (layer) {
                            try {
                                scanAndFixProperties(layer);
                                fixedCount++;
                            } catch (err) {
                                $.writeln("处理图层 " + j + " 时出错: " + err.toString());
                            }
                        }
                    }
                }
            }
            
            app.endUndoGroup();
            updateStatus("修复完成！共处理 " + fixedCount + " 个图层");
            
        } catch (err) {
            alert("修复过程中出错: " + err.toString() + "\n" + err.line);
            $.writeln(err.stack); // 输出堆栈跟踪
        }
    }

    // UI构建函数
    function buildUI(thisObj) {
        try {
            // 创建面板 - 支持停靠
            var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "表达式修复工具", undefined, {
                resizeable: true,
                independent: false
            });
            
            // 基本设置
            panel.orientation = "column";
            panel.alignChildren = ["fill", "top"];
            panel.spacing = 10;
            panel.margins = 16;

            // 设置最小尺寸，但不设置最大尺寸以允许自由调整
            panel.minimumSize = [300, 200];

            // 创建主容器并设置为自适应
            var mainGroup = panel.add("group");
            mainGroup.orientation = "column";
            mainGroup.alignChildren = ["fill", "top"];
            mainGroup.spacing = 10;
            mainGroup.alignment = ["fill", "fill"];

            // 添加说明文本 - 自动换行
            var helpText = mainGroup.add("statictext", undefined, "用于修复英文版AE模板在中文版AE中的表达式错误", {
                multiline: true,
                scrolling: false
            });
            helpText.alignment = ["fill", "top"];
            helpText.preferredSize.height = 35; // 设置合适的高度以显示两行文本

            // 状态文本容器
            var statusGroup = mainGroup.add("group");
            statusGroup.orientation = "column";
            statusGroup.alignChildren = ["fill", "top"];
            statusGroup.spacing = 5;
            statusGroup.alignment = ["fill", "top"];

            // 添加状态文本
            var statusText = statusGroup.add("statictext", undefined, "准备就绪", {
                multiline: false
            });
            statusText.alignment = ["fill", "top"];

            // 添加进度条
            var progressBar = statusGroup.add("progressbar", undefined, 0, 100);
            progressBar.alignment = ["fill", "top"];
            progressBar.preferredSize.height = 6; // 稍微降低进度条高度使其更美观
            progressBar.visible = false;

            // 创建按钮组 - 使用弹性布局
            var buttonGroup = mainGroup.add("group");
            buttonGroup.orientation = "row";
            buttonGroup.alignChildren = ["center", "center"];
            buttonGroup.spacing = 10;
            buttonGroup.alignment = ["fill", "top"];
            buttonGroup.margins = [0, 10, 0, 10]; // 增加上下边距

            // 添加修复按钮
            var fixBtn = buttonGroup.add("button", undefined, "开始修复");
            fixBtn.preferredSize.width = 100;
            fixBtn.alignment = ["center", "center"];

            // 添加撤销按钮
            var undoBtn = buttonGroup.add("button", undefined, "撤销修复");
            undoBtn.preferredSize.width = 100;
            undoBtn.alignment = ["center", "center"];
            undoBtn.enabled = false;

            // 添加弹性空间
            mainGroup.add("group").preferredSize.height = 10; // 添加间隔

            // 添加版权信息 - 使用小号字体
            var creditText = mainGroup.add("statictext", undefined, "© 2024 该插件由Boo使用Cursor制作 v1.0");
            creditText.alignment = ["center", "bottom"];
            creditText.graphics.foregroundColor = creditText.graphics.newPen(creditText.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);
            creditText.graphics.font = ScriptUI.newFont("Arial", "REGULAR", 10); // 使用小号字体

            // 添加面板大小改变事件处理
            panel.onResizing = panel.onResize = function() {
                this.layout.resize();
            };

            // 按钮点击事件保持不变
            fixBtn.onClick = function() {
                try {
                    // 获取当前活动合成
                    var activeComp = app.project.activeItem;
                    
                    if (!activeComp || !(activeComp instanceof CompItem)) {
                        alert("请先选择一个合成！");
                        return;
                    }

                    app.beginUndoGroup("修复表达式");

                    // 显示进度条
                    progressBar.visible = true;
                    progressBar.value = 0;
                    statusText.text = "开始处理...";

                    var fixedCount = 0;
                    var totalLayers = activeComp.numLayers;
                    
                    // 遍历当前合成中的所有图层
                    for (var i = 1; i <= totalLayers; i++) {
                        var layer = activeComp.layer(i);
                        if (layer && layer.effect) {
                            for (var j = 1; j <= layer.effect.numProperties; j++) {
                                var effect = layer.effect(j);
                                
                                for (var k = 1; k <= effect.numProperties; k++) {
                                    var prop = effect.property(k);
                                    if (prop && prop.expression) {
                                        var expression = prop.expression;
                                        
                                        // 效果名称映射对象
                                        var effectNameMap = {
                                            'color control': '颜色控制',
                                            'slider control': '滑块控制',
                                            'angle control': '角度控制',
                                            'point control': '点控制',
                                            'checkbox control': '复选框控制',
                                            'fill': '填充',
                                            'stroke': '描边',
                                            'gaussian blur': '高斯模糊',
                                            'fast blur': '快速模糊',
                                            'motion blur': '动态模糊',
                                            'radial blur': '径向模糊',
                                            'transform': '变换',
                                            'opacity': '不透明度',
                                            'levels': '色阶',
                                            'curves': '曲线',
                                            'exposure': '曲线',
                                            'hue/saturation': '色相/饱和度',
                                            'brightness & contrast': '亮度和对比度',
                                            'tint': '色调',
                                            'tritone': '三色调',
                                            'drop shadow': '投影',
                                            'glow': '发光',
                                            'gradient ramp': '渐变渐变',
                                            'mosaic': '马赛克',
                                            'noise': '杂色',
                                            'fractal noise': '分形杂色',
                                            'turbulent displace': '湍流置换',
                                            'offset': '位移',
                                            'echo': '回声',
                                            'time displacement': '时间置换',
                                            'posterize time': '时间色调分离',
                                            'venetian blinds': '百叶窗',
                                            'gradient': '渐变',
                                            'fill': '填充',
                                            'roughen edges': '毛边',
                                            'spherize': '球面化',
                                            'mesh warp': '网格变形',
                                            'ripple': '波纹',
                                            'paint': '绘画',
                                            'brush strokes': '画笔描边',
                                            'cartoon': '卡通',
                                            'texturize': '纹理化',
                                            'cc particle world': 'CC 粒子世界',
                                            'cc cylinder': 'CC 圆柱体',
                                            'cc sphere': 'CC 球体',
                                            'cc lens': 'CC 镜头',
                                            'cc light sweep': 'CC 扫光',
                                            'cc light burst': 'CC 光束'
                                        };

                                        // 参数名称映射对象
                                        var paramNameMap = {
                                            'color': '颜色',
                                            'slider': '滑块',
                                            'angle': '角度',
                                            'point': '点',
                                            'checkbox': '复选框',
                                            'opacity': '不透明度',
                                            'position': '位置',
                                            'scale': '缩放',
                                            'rotation': '旋转',
                                            'size': '大小',
                                            'intensity': '强度',
                                            'softness': '柔和度',
                                            'spread': '扩展',
                                            'distance': '距离',
                                            'amount': '数量',
                                            'depth': '深度',
                                            'thickness': '粗细',
                                            'offset': '偏移',
                                            'evolution': '演化',
                                            'radius': '半径',
                                            'direction': '方向',
                                            'speed': '速度',
                                            'width': '宽度',
                                            'height': '高度'
                                        };

                                        // 处理效果名称（区分大小写）
                                        for (var effectName in effectNameMap) {
                                            var regex = new RegExp('"' + effectName + '"', 'gi');
                                            expression = expression.replace(regex, '"' + effectNameMap[effectName] + '"');
                                        }

                                        // 处理参数名称（区分大小写）
                                        for (var paramName in paramNameMap) {
                                            var regex = new RegExp('"' + paramName + '"', 'gi');
                                            expression = expression.replace(regex, '"' + paramNameMap[paramName] + '"');
                                        }
                                        
                                        // 更新表达式
                                        prop.expression = expression;
                                        fixedCount++;
                                    }
                                }
                            }
                        }
                        
                        // 更新进度条
                        progressBar.value = (i / totalLayers) * 100;
                        statusText.text = "正在处理... " + Math.round((i / totalLayers) * 100) + "%";
                    }
                    
                    app.endUndoGroup();
                    
                    // 更新界面状态
                    progressBar.value = 100;
                    statusText.text = "修复完成！共修复 " + fixedCount + " 个表达式";
                    undoBtn.enabled = true;
                    
                    // 3秒后隐藏进度条
                    $.sleep(3000);
                    progressBar.visible = false;
                    
                } catch (err) {
                    alert("修复过程中出错: " + err.toString());
                    progressBar.visible = false;
                }
            };

            // 添加撤销按钮事件
            undoBtn.onClick = function() {
                app.executeCommand(16); // 执行撤销命令
                statusText.text = "已撤销修复";
                undoBtn.enabled = false;
            };

            // 显示面板
            if (panel instanceof Window) {
                panel.center();
                panel.show();
            } else {
                panel.layout.layout(true);
            }
            
            return panel;
            
        } catch(err) {
            alert("创建界面时出错: " + err.toString());
        }
    }

    // 修改脚本入口点
    if (parseFloat(app.version) < 8) {
        alert("此脚本需要 After Effects CS3 或更高版本。");
    } else {
        // 创建停靠面板
        var scriptName = "表达式修复工具";
        var myPanel = buildUI(this);
        
        if (myPanel instanceof Window) {
            // 如果是浮动面板，设置其属性
            myPanel.center();
            myPanel.show();
        } else {
            // 如果是停靠面板，设置其属性
            myPanel.layout.layout(true);
            myPanel.layout.resize();
        }
    }
} 
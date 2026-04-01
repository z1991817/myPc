import { ChangeEvent, Key, useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { useRouter } from "next/router";

import DefaultLayout from "@/layouts/default";
import { uploadImage, textToImage } from "@/api/images";

const aspectRatios = ["1:1", "4:5", "9:16", "16:9"];
const outputCounts = ["1", "4", "8", "12"];
const models = ["GPT Image", "Flux Pro", "Recraft V3"];

type UploadedImage = {
  id: string;
  name: string;
  src: string;
  url: string; // 后端返回的图片 URL
};

type ConversationMessage = {
  role: "system" | "user" | "assistant";
  title: string;
  content: string;
  images?: Array<{ id: string; src: string; alt: string }>;
  isLoading?: boolean; // 标记是否为加载状态
};

const initialConversation: ConversationMessage[] = [
  {
    role: "system",
    title: "系统",
    content:
      "先上传参考图，再补充人物、材质、镜头和背景细节，生成结果会更稳定。",
  },
];

const selectClassNames = {
  trigger:
    "h-11 rounded-2xl border border-white/10 bg-white/[0.03] px-4 data-[hover=true]:border-[#FF1CF7]/40 data-[open=true]:border-[#FF1CF7]/50",
  value: "text-sm text-white",
  selectorIcon: "text-white/45",
} as const;

function getSelectionValue(keys: "all" | Set<Key>) {
  if (keys === "all") return null;

  const [value] = Array.from(keys);

  return typeof value === "string" ? value : value ? String(value) : null;
}

export default function CreatePage() {
  const router = useRouter();
  const [selectedRatio, setSelectedRatio] = useState("9:16");
  const [selectedCount, setSelectedCount] = useState("1");
  const [selectedModel, setSelectedModel] = useState("GPT Image");
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [activeSelect, setActiveSelect] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [conversation, setConversation] =
    useState<ConversationMessage[]>(initialConversation);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined); // 存储会话 ID

  /**
   * 从 sessionStorage 中获取隐式传参数据并回显
   */
  useEffect(() => {
    const paramsStr = sessionStorage.getItem("createImageParams");

    if (paramsStr) {
      try {
        const params = JSON.parse(paramsStr);

        // 回显 prompt
        if (params.prompt) {
          setPrompt(params.prompt);
        }

        // 回显 model
        if (params.model && models.includes(params.model)) {
          setSelectedModel(params.model);
        }

        // 回显 size（转换为比例格式）
        if (params.size) {
          const [width, height] = params.size.split("x").map(Number);

          if (width && height) {
            // 简化比例
            if (width === height) setSelectedRatio("1:1");
            else if (width === 1024 && height === 1280) setSelectedRatio("4:5");
            else if (width === 1024 && height === 1820)
              setSelectedRatio("9:16");
            else if (width === 1820 && height === 1024)
              setSelectedRatio("16:9");
          }
        }

        // 清除 sessionStorage 中的参数，避免下次进入页面时重复使用
        sessionStorage.removeItem("createImageParams");
      } catch (error) {
        console.error("解析参数失败:", error);
      }
    }
  }, []);

  const handleImageLoad = (imageId: string) => {
    setLoadedImages((current) => ({ ...current, [imageId]: true }));
  };

  const handleUploadChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) return;

    setUploading(true);

    try {
      // 并发上传所有文件
      const uploadPromises = files.map(async (file) => {
        try {
          // 调用后端上传接口
          const response = await uploadImage(file);

          if (response.code === 200 && response.data.url) {
            return {
              id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
              name: file.name,
              src: response.data.url, // 使用后端返回的 URL
              url: response.data.url,
            };
          } else {
            throw new Error(response.message || "上传失败");
          }
        } catch {
          // 上传失败时返回 null
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      // 过滤掉上传失败的文件
      const successImages = results.filter(
        (img): img is UploadedImage => img !== null,
      );

      if (successImages.length > 0) {
        setUploadedImages((current) => [...current, ...successImages]);
      }

      if (successImages.length < files.length) {
        alert(`成功上传 ${successImages.length}/${files.length} 张图片`);
      }
    } catch {
      alert("上传失败，请重试");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveUploadedImage = (imageId: string) => {
    setUploadedImages((current) =>
      current.filter((image) => image.id !== imageId),
    );
  };

  // 从 markdown 内容中提取图片 URL
  const extractImageUrls = (content: string): string[] => {
    const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    const urls: string[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      urls.push(match[1]);
    }

    return urls;
  };

  // 发送消息生成图片
  const handleSendMessage = async () => {
    if (!prompt.trim() || generating) return;

    const userMessage: ConversationMessage = {
      role: "user",
      title: "你",
      content: prompt,
    };

    // 添加用户消息
    setConversation((prev) => [...prev, userMessage]);

    // 立即添加 AI 消息占位符，显示加载状态
    const loadingMessage = {
      role: "assistant" as const,
      title: "AI 图像",
      content: "",
      images: [
        {
          id: "loading",
          src: "",
          alt: "生成中...",
        },
      ],
      isLoading: true,
    };

    setConversation((prev) => [...prev, loadingMessage]);
    setPrompt("");
    setGenerating(true);

    try {
      // 获取第一张上传的图片 URL（如果有）
      const imageUrl =
        uploadedImages.length > 0 ? uploadedImages[0].url : undefined;

      // 调用真实接口，传入 session_id（如果存在）
      const response = await textToImage(prompt, imageUrl, sessionId);

      if (response.code === 200 && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        const imageUrls = extractImageUrls(content);

        // 保存 session_id（如果接口返回了）
        if (response.data.session_id) {
          setSessionId(response.data.session_id);
        }

        // 更新最后一条消息，替换加载状态为实际图片
        setConversation((prev) => {
          const newConversation = [...prev];
          const lastIndex = newConversation.length - 1;

          newConversation[lastIndex] = {
            role: "assistant",
            title: "AI 图像",
            content: "",
            images: imageUrls.map((url, index) => ({
              id: `gen-${Date.now()}-${index}`,
              src: url,
              alt: `生成结果 ${index + 1}`,
            })),
          };

          return newConversation;
        });
      } else {
        throw new Error("生成失败");
      }
    } catch (error) {
      // 移除加载消息
      setConversation((prev) => prev.slice(0, -1));

      const errorMessage =
        error instanceof Error ? error.message : "生成图片失败，请重试";

      alert(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DefaultLayout fullWidth>
      <section className="h-[calc(100vh-6.25rem)] min-h-[720px] overflow-hidden px-4 pb-4 md:px-6 lg:px-8">
        <div className="flex h-full overflow-hidden rounded-[28px] border border-white/10 bg-[#050505] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="grid h-full min-h-0 w-full grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="min-h-0 overflow-y-auto border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] xl:border-b-0 xl:border-r">
              <div className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                      工作台
                    </p>
                    <h1 className="mt-2 text-xl font-semibold">AI 图像</h1>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                    专业模式
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-white/80">图片上传</p>
                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-5 text-center transition hover:border-[#FF1CF7]/40 hover:bg-white/[0.05] ${uploading ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF1CF7]/15 text-xl text-[#f3a6ff]">
                      {uploading ? "..." : "+"}
                    </div>
                    <div>
                      <p className="font-medium">
                        {uploading ? "上传中..." : "拖拽图片到这里"}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        支持 PNG / JPG，建议小于 10MB
                      </p>
                    </div>
                    <input
                      multiple
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      disabled={uploading}
                      type="file"
                      onChange={handleUploadChange}
                    />
                  </label>

                  {uploadedImages.length ? (
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                        >
                          <button
                            aria-label={`删除 ${image.name}`}
                            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/65 text-sm text-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-sm transition duration-200 hover:scale-105 hover:border-[#FF1CF7]/50 hover:bg-gradient-to-br hover:from-[#FF1CF7]/30 hover:to-[#b249f8]/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1CF7]/60"
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleRemoveUploadedImage(image.id);
                            }}
                          >
                            <span className="-mt-px leading-none">×</span>
                          </button>
                          <div className="aspect-square overflow-hidden bg-black/30">
                            <img
                              alt={image.name}
                              className="h-full w-full object-cover"
                              src={image.src}
                            />
                          </div>
                          <div className="truncate px-2 py-1.5 text-[11px] text-white/55">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="relative pt-3">
                  <div
                    className={`pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full border px-3 py-0.5 text-xs font-medium transition-all duration-200 ${
                      activeSelect === "ratio"
                        ? "scale-90 border-[#FF1CF7]/40 bg-[#050505] text-[#f3a6ff]"
                        : "border-white/10 bg-[#050505] text-white/65"
                    }`}
                  >
                    宽高比例
                  </div>
                  <Select
                    disallowEmptySelection
                    aria-label="宽高比例"
                    classNames={selectClassNames}
                    listboxProps={{
                      itemClasses: {
                        base: "text-white data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10",
                      },
                    }}
                    popoverProps={{
                      shouldBlockScroll: false,
                      classNames: {
                        content:
                          "border border-white/10 bg-[#111111] text-white",
                      },
                    }}
                    renderValue={() => <span>{selectedRatio}</span>}
                    selectedKeys={new Set([selectedRatio])}
                    selectionMode="single"
                    onOpenChange={(isOpen) =>
                      setActiveSelect(isOpen ? "ratio" : null)
                    }
                    onSelectionChange={(keys) => {
                      const value = getSelectionValue(keys);

                      if (value) setSelectedRatio(value);
                    }}
                  >
                    {aspectRatios.map((ratio) => (
                      <SelectItem key={ratio}>{ratio}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="relative pt-3">
                  <div
                    className={`pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full border px-3 py-0.5 text-xs font-medium transition-all duration-200 ${
                      activeSelect === "model"
                        ? "scale-90 border-[#FF1CF7]/40 bg-[#050505] text-[#f3a6ff]"
                        : "border-white/10 bg-[#050505] text-white/65"
                    }`}
                  >
                    模型选择
                  </div>
                  <Select
                    disallowEmptySelection
                    aria-label="模型选择"
                    classNames={selectClassNames}
                    listboxProps={{
                      itemClasses: {
                        base: "text-white data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10",
                      },
                    }}
                    popoverProps={{
                      shouldBlockScroll: false,
                      classNames: {
                        content:
                          "border border-white/10 bg-[#111111] text-white",
                      },
                    }}
                    renderValue={() => <span>{selectedModel}</span>}
                    selectedKeys={new Set([selectedModel])}
                    selectionMode="single"
                    onOpenChange={(isOpen) =>
                      setActiveSelect(isOpen ? "model" : null)
                    }
                    onSelectionChange={(keys) => {
                      const value = getSelectionValue(keys);

                      if (value) setSelectedModel(value);
                    }}
                  >
                    {models.map((model) => (
                      <SelectItem key={model}>{model}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="relative pt-3">
                  <div
                    className={`pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full border px-3 py-0.5 text-xs font-medium transition-all duration-200 ${
                      activeSelect === "count"
                        ? "scale-90 border-[#FF1CF7]/40 bg-[#050505] text-[#f3a6ff]"
                        : "border-white/10 bg-[#050505] text-white/65"
                    }`}
                  >
                    输出数量
                  </div>
                  <Select
                    disallowEmptySelection
                    aria-label="输出数量"
                    classNames={selectClassNames}
                    listboxProps={{
                      itemClasses: {
                        base: "text-white data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10",
                      },
                    }}
                    popoverProps={{
                      shouldBlockScroll: false,
                      classNames: {
                        content:
                          "border border-white/10 bg-[#111111] text-white",
                      },
                    }}
                    renderValue={() => <span>{selectedCount} 张</span>}
                    selectedKeys={new Set([selectedCount])}
                    selectionMode="single"
                    onOpenChange={(isOpen) =>
                      setActiveSelect(isOpen ? "count" : null)
                    }
                    onSelectionChange={(keys) => {
                      const value = getSelectionValue(keys);

                      if (value) setSelectedCount(value);
                    }}
                  >
                    {outputCounts.map((count) => (
                      <SelectItem key={count}>{count} 张</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </aside>

            <main className="min-h-0 border-b border-white/10 xl:border-b-0 xl:border-r">
              <div className="flex h-full min-h-0 flex-col p-5 md:p-6">
                <div className="min-h-0 flex-1">
                  <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                      <div className="space-y-4">
                        {conversation.map((item, index) => {
                          const isUser = item.role === "user";

                          return (
                            <div
                              key={`${item.role}-${index}`}
                              className={`max-w-[92%] rounded-2xl border px-4 py-3 ${
                                isUser
                                  ? "ml-auto border-[#FF1CF7]/25 bg-[#FF1CF7]/10"
                                  : "border-white/10 bg-white/[0.04]"
                              }`}
                            >
                              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                                {item.title}
                              </p>
                              {item.content ? (
                                <p className="mt-2 text-sm leading-6 text-white/78">
                                  {item.content}
                                </p>
                              ) : null}

                              {item.images && item.images.length > 0 ? (
                                <div className="mt-4 space-y-3">
                                  {!item.isLoading ? (
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                                      <span className="rounded-full border border-white/10 px-3 py-1">
                                        本次返回 {item.images.length} 张
                                      </span>
                                      <span className="rounded-full border border-white/10 px-3 py-1">
                                        支持继续细化
                                      </span>
                                    </div>
                                  ) : null}

                                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    {item.isLoading ? (
                                      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]">
                                        <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#FF1CF7]" />
                                          </div>
                                          <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,rgba(255,28,247,0.18),rgba(178,73,248,0.08),rgba(255,255,255,0.04))]" />
                                        </div>
                                        <div className="px-4 py-3 text-center text-sm text-white/55">
                                          生成中...
                                        </div>
                                      </div>
                                    ) : (
                                      item.images.map((image) => {
                                        const loaded = loadedImages[image.id];

                                        return (
                                          <div
                                            key={image.id}
                                            className="group overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] cursor-pointer transition-transform hover:scale-[1.02]"
                                            onClick={() =>
                                              setPreviewImage(image.src)
                                            }
                                          >
                                            <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
                                              {!loaded ? (
                                                <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,rgba(255,28,247,0.18),rgba(178,73,248,0.08),rgba(255,255,255,0.04))]" />
                                              ) : null}
                                              <img
                                                alt={image.alt}
                                                className={`h-full w-full object-cover transition duration-500 ${
                                                  loaded
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                }`}
                                                loading="lazy"
                                                src={image.src}
                                                onLoad={() =>
                                                  handleImageLoad(image.id)
                                                }
                                              />
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3 text-sm">
                                              <span className="text-white/75">
                                                {image.alt}
                                              </span>
                                              <span className="text-white/40">
                                                点击预览
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-white/10 p-4">
                      <div className="rounded-[24px] border border-white/10 bg-black/30 p-3">
                        <textarea
                          className="min-h-24 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                          disabled={generating}
                          placeholder="继续输入你的创作需求，例如：保留人物，但把头发改成银白色，背景改成室内柔光。"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap gap-2 text-xs text-white/45" />
                          <Button
                            className="bg-gradient-to-r from-[#FF1CF7] to-[#b249f8] px-6 font-semibold text-white"
                            disabled={!prompt.trim() || generating}
                            isLoading={generating}
                            onPress={handleSendMessage}
                          >
                            {generating ? "生成中..." : "发送"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* 图片预览模态框 */}
      {previewImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <button
            aria-label="关闭预览"
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-2xl text-white/90 transition hover:bg-white/10 hover:text-white"
            type="button"
            onClick={() => setPreviewImage(null)}
          >
            ×
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              alt="预览图片"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              src={previewImage}
            />
          </div>
        </div>
      ) : null}
    </DefaultLayout>
  );
}

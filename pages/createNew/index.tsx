import React, { useState, useMemo, useRef } from "react";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Select, SelectItem } from "@heroui/select";
import { Card } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import {
  SparklesIcon,
  CoinIcon,
  EditIcon,
  ImageIcon,
  InfoIcon,
  DownloadIcon,
  RotateCwIcon,
  PaletteIcon,
} from "@/components/icons";
import { generateImage, uploadImage, imageToImage } from "@/api/images";

/**
 * 图片尺寸选项类型
 */
interface AspectRatioOption {
  key: string;
  label: string;
  ratio: string;
  value: string;
}

/**
 * 可用图片尺寸列表
 */
const ASPECT_RATIOS: AspectRatioOption[] = [
  { value: "1024x1024", label: "1:1", ratio: "1:1", key: "1:1" },
  { value: "1024x1792", label: "2:3", ratio: "2:3", key: "2:3" },
  { value: "1792x1024 ", label: "3:2", ratio: "3:2", key: "3:2" },
];

/**
 * Tab类型定义
 */
type TabType = "text-to-image" | "image-to-image";

/**
 * 模型选项类型
 */
interface ModelOption {
  key: string;
  label: string;
  description: string;
  badges: Array<{ text: string; color: "primary" | "warning" | "success" }>;
}

/**
 * 可用模型列表
 */
const MODELS: ModelOption[] = [
  {
    key: "gpt-image-1.5",
    label: "GPT Image 1.5",
    description: "High-fidelity image generation with strong prompt following",
    badges: [
      { text: "New", color: "primary" },
      { text: "Hot", color: "warning" },
    ],
  },
  {
    key: "gpt-image-1.0",
    label: "GPT Image 1.0",
    description: "Standard quality image generation",
    badges: [],
  },
];

/**
 * 生成的图片类型
 */
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  isLoaded: boolean;
}

/**
 * CreateNew 页面组件
 * GPT Image 1.5 生成器页面
 */
const CreateNew: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<TabType>("text-to-image");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-image-1.5");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loadingPlaceholders, setLoadingPlaceholders] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [urlImages, setUrlImages] = useState<string[]>([]);

  // 计算提示词字符数
  const promptLength = useMemo(() => prompt.length, [prompt]);

  // 验证表单是否可提交
  const canGenerate = useMemo(() => {
    return prompt.trim().length > 0 && !isGenerating;
  }, [prompt, isGenerating]);

  /**
   * 处理图片加载完成
   */
  const handleImageLoad = (imageId: string) => {
    setGeneratedImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, isLoaded: true } : img,
      ),
    );
  };

  /**
   * 处理生成图像
   */
  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setLoadingPlaceholders(1);

    try {
      const selectedRatio = ASPECT_RATIOS.find(
        (ratio) => ratio.key === selectedAspectRatio,
      );
      const sizeValue = selectedRatio?.value || "1024x1024";

      let response;

      // 判断是文生图还是图生图
      if (activeTab === "image-to-image") {
        // 获取图片URL数组
        const imageUrls = useImageUrl ? urlImages.filter(u => u) : uploadedImages;

        if (imageUrls.length === 0) {
          setErrorMessage("请先上传参考图片或输入图片链接");
          setIsErrorModalOpen(true);
          return;
        }

        response = await imageToImage(prompt, imageUrls, sizeValue);
      } else {
        response = await generateImage(prompt, sizeValue);
      }

      if (response.success && response.data.thirdPartyResponse.data) {
        const newImages: GeneratedImage[] =
          response.data.thirdPartyResponse.data.map((item, index) => ({
            id: `${Date.now()}-${index}`,
            url: item.url,
            prompt: item.revised_prompt,
            isLoaded: false,
          }));

        setGeneratedImages((prev) => [...newImages, ...prev]);

        // 显示成功提示
        addToast({
          title: "生成成功",
          description: "图片已生成完成",
          color: "success",
        });

        // 清空提示词
        setPrompt("");
      }
    } catch (error) {
      console.error("生成失败:", error);
      const errorMsg =
        error instanceof Error ? error.message : "生成图片失败，请重试";
      setErrorMessage(errorMsg);
      setIsErrorModalOpen(true);
    } finally {
      setIsGenerating(false);
      setLoadingPlaceholders(0);
    }
  };

  /**
   * 生成随机提示词
   */
  const handleRandomPrompt = () => {
    const randomPrompts = [
      "一只可爱的橘猫在阳光下打盹",
      "未来城市的霓虹灯夜景",
      "梦幻般的水下世界，五彩斑斓的珊瑚礁",
      "宁静的日式庭院，樱花飘落",
      "科幻风格的太空站内部",
    ];
    const randomIndex = Math.floor(Math.random() * randomPrompts.length);

    setPrompt(randomPrompts[randomIndex]);
  };

  /**
   * 处理图片上传
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 10 - uploadedImages.length;
    if (remainingSlots === 0) {
      setErrorMessage("最多只能上传10张图片");
      setIsErrorModalOpen(true);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const invalidFiles = filesToProcess.filter((file) => !file.type.startsWith("image/"));

    if (invalidFiles.length > 0) {
      setErrorMessage("请只上传图片文件");
      setIsErrorModalOpen(true);
      return;
    }

    setIsUploading(true);

    // 上传每个文件到服务器
    for (const file of filesToProcess) {
      try {
        const response = await uploadImage(file);
        if (response.code === 200 && response.data.url) {
          setUploadedImages((prev) => [...prev, response.data.url]);
        }
      } catch (error) {
        console.error("上传失败:", error);
        setErrorMessage("图片上传失败，请重试");
        setIsErrorModalOpen(true);
      }
    }

    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * 移除指定图片
   */
  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * 添加URL输入框
   */
  const handleAddUrlInput = () => {
    if (imageUrls.length < 10) {
      setImageUrls(prev => [...prev, ""]);
    }
  };

  /**
   * 更新URL输入
   */
  const handleUrlChange = (index: number, value: string) => {
    setImageUrls(prev => prev.map((url, i) => i === index ? value : url));
    if (value.trim()) {
      const newUrlImages = [...urlImages];
      newUrlImages[index] = value;
      setUrlImages(newUrlImages);
    }
  };

  /**
   * 删除URL输入框
   */
  const handleRemoveUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setUrlImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * 下载图片到本地
   */
  const handleDownloadImage = async (imageUrl: string, imageId: string) => {
    try {
      // 获取图片数据
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;

      // 设置文件名（使用时间戳和ID）
      const timestamp = new Date().getTime();
      const fileName = `gpt-image-${timestamp}-${imageId}.png`;

      link.download = fileName;

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setErrorMessage("下载图片失败，请重试");
      setIsErrorModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen py-6 lg:py-12 px-4 bg-background text-foreground">
      {/* 主容器 - 宽度限制为1280px */}
      <main className="max-w-[1280px] mx-auto">
        {/* 页面头部 */}
        <header className="text-center mb-6 lg:mb-12">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4">
            GPT Image 1.5 生成器
          </h1>
          <p className="text-default-500 max-w-2xl mx-auto leading-relaxed text-sm lg:text-base">
            使用 GPT Image 1.5 生成器创建令人惊叹的视觉效果。GPT Image 1.5 是
            OpenAI 最新的图像生成模型， 能生成高质量的 GPT
            图像，具有卓越的精度、强大的提示遵循能力和精细的细节。
          </p>
        </header>

        {/* 内容网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* 左侧设置面板 */}
          <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            <Card className="p-6">
              {/* 面板头部 */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">GPT Image 生成器</h2>
                <div className="flex items-center gap-1 text-default-400">
                  <CoinIcon className="w-4 h-4" />
                  <span className="text-sm">8</span>
                </div>
              </div>

              {/* 标签切换 - 使用HeroUI Tabs组件 */}
              <Tabs
                fullWidth
                className="mb-6"
                selectedKey={activeTab}
                size="md"
                onSelectionChange={(key) => setActiveTab(key as TabType)}
              >
                <Tab
                  key="text-to-image"
                  title={
                    <div className="flex items-center gap-2">
                      <EditIcon className="w-4 h-4" />
                      <span>Text to Image</span>
                    </div>
                  }
                />
                <Tab
                  key="image-to-image"
                  title={
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Image to Image</span>
                    </div>
                  }
                />
              </Tabs>

              {/* 模型选择 - 使用HeroUI Select组件 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  {activeTab === "text-to-image"
                    ? "Text to Image Model"
                    : "Image to Image Model"}
                </label>
                <Select
                  className="w-full"
                  classNames={{
                    trigger: "min-h-[72px] py-3",
                  }}
                  placeholder="选择模型"
                  renderValue={(items) => {
                    const item = items[0];
                    const model = MODELS.find((m) => m.key === item.key);

                    if (!model) return null;

                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-default-200 rounded flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">
                              {model.label}
                            </span>
                            {model.badges.map((badge, idx) => (
                              <Chip
                                key={idx}
                                className="text-[10px] h-4 px-1"
                                color={badge.color}
                                size="sm"
                                variant="flat"
                              >
                                {badge.text}
                              </Chip>
                            ))}
                          </div>
                          <div className="text-[10px] text-default-500 mt-0.5">
                            {model.description}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                  selectedKeys={[selectedModel]}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string;

                    setSelectedModel(key);
                  }}
                >
                  {MODELS.map((model) => (
                    <SelectItem key={model.key}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.label}</span>
                        {model.badges.map((badge, idx) => (
                          <Chip
                            key={idx}
                            className="text-[10px]"
                            color={badge.color}
                            size="sm"
                            variant="flat"
                          >
                            {badge.text}
                          </Chip>
                        ))}
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* 图片上传区域 - 仅在图生图模式下显示 */}
              {activeTab === "image-to-image" && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label
                      className="block text-sm font-medium"
                      htmlFor="image-upload"
                    >
                      上传参考图片 ({useImageUrl ? urlImages.filter(u => u).length : uploadedImages.length}/10)
                    </label>
                    <Switch
                      classNames={{
                        base: "inline-flex flex-row-reverse items-center gap-2",
                        wrapper: "h-5 w-9",
                        thumb: "w-3 h-3"
                      }}
                      isSelected={useImageUrl}
                      size="sm"
                      onValueChange={setUseImageUrl}
                    >
                      <span className="text-xs text-default-500">使用图片链接</span>
                    </Switch>
                  </div>

                  {!useImageUrl ? (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden aspect-square">
                        <img
                          alt={`上传的图片 ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          src={img}
                        />
                        <Button
                          className="absolute top-1 right-1 min-w-6 h-6 p-0 bg-black/50 text-white text-lg"
                          size="sm"
                          onPress={() => handleRemoveImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    {uploadedImages.length < 10 && (
                      <label
                        className={`border-2 border-dashed border-default-300 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                        htmlFor="image-upload"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-default-500 mt-1">上传中...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 text-default-400" />
                            <span className="text-xs text-default-500 mt-1">上传</span>
                          </>
                        )}
                        <input
                          id="image-upload"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          multiple
                          type="file"
                          disabled={isUploading}
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                  ) : (
                    <div className="space-y-1.5">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-xs text-default-500 w-20">图片 URL #{index + 1}</span>
                          <input
                            className="flex-1 bg-default-100 border border-default-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                            placeholder="https://example.com/image.jpg"
                            type="text"
                            value={url}
                            onChange={(e) => handleUrlChange(index, e.target.value)}
                          />
                          <Button
                            className="min-w-8 h-7 p-0 text-lg"
                            color="danger"
                            size="sm"
                            variant="light"
                            onPress={() => handleRemoveUrl(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      {imageUrls.length < 10 && (
                        <button
                          className="w-full border-2 border-dashed border-default-300 rounded-lg py-2 text-sm text-default-500 hover:border-primary hover:text-primary transition-colors"
                          type="button"
                          onClick={handleAddUrlInput}
                        >
                          + 添加图片 URL
                        </button>
                      )}
                      {urlImages.filter(u => u).length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {urlImages.filter(u => u).map((url, index) => (
                            <div key={index} className="relative rounded-lg overflow-hidden aspect-square bg-default-100">
                              <img
                                alt={`URL图片 ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                src={url}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <Button
                                className="absolute top-1 right-1 min-w-6 h-6 p-0 bg-black/50 text-white text-lg"
                                size="sm"
                                onPress={() => {
                                  const actualIndex = urlImages.findIndex((u, i) => u === url && i === index);
                                  if (actualIndex !== -1) {
                                    handleRemoveUrl(actualIndex);
                                  }
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 提示词输入区域 - 使用HeroUI Textarea组件 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    AI图像提示词*
                    <InfoIcon className="w-3.5 h-3.5 text-default-400" />
                  </label>
                </div>
                <textarea
                  className="w-full bg-default-100 border-2 border-default-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                  placeholder="描述你想要生成的图像..."
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-default-500">
                    {promptLength} / 4000
                  </span>
                </div>
              </div>

              {/* 图片尺寸选择 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  图片比例
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.key}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        selectedAspectRatio === ratio.key
                          ? "border-primary bg-primary/10"
                          : "border-default-200 bg-default-100 hover:border-primary/50"
                      }`}
                      type="button"
                      onClick={() => setSelectedAspectRatio(ratio.key)}
                    >
                      <div
                        className={`mb-2 rounded border-2 ${
                          selectedAspectRatio === ratio.key
                            ? "border-primary bg-primary/20"
                            : "border-default-300 bg-default-200"
                        }`}
                        style={{
                          width:
                            ratio.key === "1:1"
                              ? "32px"
                              : ratio.key === "2:3"
                                ? "24px"
                                : "40px",
                          height:
                            ratio.key === "1:1"
                              ? "32px"
                              : ratio.key === "2:3"
                                ? "36px"
                                : "27px",
                        }}
                      />
                      <span
                        className={`text-xs font-medium ${
                          selectedAspectRatio === ratio.key
                            ? "text-primary"
                            : "text-default-600"
                        }`}
                      >
                        {ratio.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 生成按钮 - 使用HeroUI Button组件 */}
              <Button
                className="w-full font-semibold bg-gradient-to-r from-primary to-secondary"
                color="primary"
                isDisabled={!canGenerate}
                isLoading={isGenerating}
                size="lg"
                startContent={!isGenerating && <SparklesIcon size={20} />}
                onPress={handleGenerate}
              >
                {isGenerating ? "生成中..." : "生成图像"}
                {!isGenerating && (
                  <span className="text-xs opacity-80 ml-1">(消耗 8 币)</span>
                )}
              </Button>
            </Card>
          </section>

          {/* 右侧历史记录面板 */}
          <section className="lg:col-span-7 xl:col-span-8">
            <Card className="p-4 lg:p-6">
              {/* 历史记录头部 */}
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                {/* <h2 className="text-lg font-semibold">生成历史</h2> */}
              </div>
              {/* 图片网格 */}
              <div className="w-full h-[400px] lg:h-[600px] rounded-2xl lg:rounded-3xl border border-default-200/30 bg-muted/10 backdrop-blur-sm overflow-hidden relative flex flex-col shadow-2xl">
                <div className="w-full h-full bg-muted/30 flex items-center justify-center p-3 lg:p-4">
                  {/* 加载中的骨架屏 - 带闪烁动画 */}
                  {loadingPlaceholders > 0 &&
                    Array.from({ length: loadingPlaceholders }).map(
                      (_, index) => (
                        <div
                          key={`loading-${index}`}
                          className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden"
                        >
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 animate-pulse flex items-center justify-center">
                            <div className="text-center px-8">
                              {/* 星星闪烁动画 */}
                              <div className="relative w-24 h-24 mx-auto mb-6">
                                {/* 中心大星星 */}
                                <SparklesIcon
                                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse"
                                  size={48}
                                />
                                {/* 周围小星星 - 上 */}
                                <SparklesIcon
                                  className="absolute top-0 left-1/2 -translate-x-1/2 text-secondary animate-ping"
                                  size={20}
                                  style={{ animationDuration: "1.5s" }}
                                />
                                {/* 周围小星星 - 右 */}
                                <SparklesIcon
                                  className="absolute top-1/2 right-0 -translate-y-1/2 text-primary animate-ping"
                                  size={20}
                                  style={{ animationDuration: "2s" }}
                                />
                                {/* 周围小星星 - 下 */}
                                <SparklesIcon
                                  className="absolute bottom-0 left-1/2 -translate-x-1/2 text-secondary animate-ping"
                                  size={20}
                                  style={{ animationDuration: "1.8s" }}
                                />
                                {/* 周围小星星 - 左 */}
                                <SparklesIcon
                                  className="absolute top-1/2 left-0 -translate-y-1/2 text-primary animate-ping"
                                  size={20}
                                  style={{ animationDuration: "2.2s" }}
                                />
                              </div>
                              <p className="text-base font-semibold text-foreground mb-2">
                                正在使用 GPT Image 1.5 创作您的图像
                              </p>
                              <p className="text-sm text-muted-foreground">
                                这通常需要 1-3 分钟，具体取决于图像复杂度
                              </p>
                            </div>
                          </div>
                        </div>
                      ),
                    )}

                  {/* 已生成的图片 */}
                  {generatedImages.map((image) => (
                    <div
                      key={image.id}
                      className="w-full h-full flex flex-col items-center justify-center gap-3 lg:gap-6"
                    >
                      {/* 图片容器 */}
                      <div
                        className="w-full max-w-[600px] min-h-[350px] lg:min-h-[500px] max-h-[350px] lg:max-h-[500px] cursor-pointer relative overflow-hidden rounded-xl lg:rounded-2xl flex items-center justify-center"
                        onClick={() => setPreviewImage(image.url)}
                      >
                        {!image.isLoaded && (
                          <div className="absolute inset-0 z-10 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 animate-pulse flex items-center justify-center">
                            <div className="text-center px-8">
                              {/* 星星闪烁动画 */}
                              <div className="relative w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4">
                                {/* 中心大星星 */}
                                <SparklesIcon
                                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse"
                                  size={32}
                                />
                                {/* 周围小星星 - 上 */}
                                <SparklesIcon
                                  className="absolute top-0 left-1/2 -translate-x-1/2 text-secondary animate-ping"
                                  size={14}
                                  style={{ animationDuration: "1.5s" }}
                                />
                                {/* 周围小星星 - 右 */}
                                <SparklesIcon
                                  className="absolute top-1/2 right-0 -translate-y-1/2 text-primary animate-ping"
                                  size={14}
                                  style={{ animationDuration: "2s" }}
                                />
                                {/* 周围小星星 - 下 */}
                                <SparklesIcon
                                  className="absolute bottom-0 left-1/2 -translate-x-1/2 text-secondary animate-ping"
                                  size={14}
                                  style={{ animationDuration: "1.8s" }}
                                />
                                {/* 周围小星星 - 左 */}
                                <SparklesIcon
                                  className="absolute top-1/2 left-0 -translate-y-1/2 text-primary animate-ping"
                                  size={14}
                                  style={{ animationDuration: "2.2s" }}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                图片加载中...
                              </p>
                            </div>
                          </div>
                        )}
                        <img
                          alt={image.prompt}
                          className={`max-w-full max-h-full object-contain transition-all duration-500 hover:scale-105 ${
                            image.isLoaded ? "opacity-100" : "opacity-0"
                          }`}
                          loading="lazy"
                          src={image.url}
                          onLoad={() => handleImageLoad(image.id)}
                        />
                      </div>

                      {/* 操作按钮组 */}
                      <div className="w-full max-w-[600px] grid grid-cols-2 gap-2 lg:gap-3">
                        {/* 下载图片按钮 */}
                        <Button
                          className="bg-default-100 text-foreground border border-default-200"
                          size="md"
                          startContent={
                            <DownloadIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                          }
                          variant="flat"
                          onPress={() =>
                            handleDownloadImage(image.url, image.id)
                          }
                        >
                          下载图片
                        </Button>

                        {/* 重新生成按钮 */}
                        <Button
                          className="bg-gradient-to-r from-primary to-secondary text-white"
                          size="md"
                          startContent={
                            <RotateCwIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                          }
                        >
                          继续修改
                        </Button>
                      </div>
                    </div>
                  ))}
                  {/* 空状态提示 */}
                  {generatedImages.length === 0 &&
                    loadingPlaceholders === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <PaletteIcon className="h-10 w-10 lg:h-12 lg:w-12 text-primary" />
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-2">
                          准备好创作
                        </div>
                        <p className="text-muted-foreground max-w-md">
                          输入提示词开始创作精美图像
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>

      {/* 图片预览模态框 */}
      {previewImage && (
        <button
          aria-label="图片预览"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm border-0 cursor-default"
          type="button"
          onClick={() => setPreviewImage(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setPreviewImage(null);
          }}
        >
          <button
            aria-label="关闭预览"
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-2xl text-white/90 transition hover:bg-white/10 hover:text-white border border-white/20"
            type="button"
            onClick={() => setPreviewImage(null)}
          >
            ×
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            role="button"
            tabIndex={0}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
              }
            }}
          >
            <img
              alt="预览图片"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              src={previewImage}
            />
          </div>
        </button>
      )}

      {/* 错误提示模态框 */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>提示</ModalHeader>
          <ModalBody>
            <p>{errorMessage}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setIsErrorModalOpen(false)}>
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CreateNew;

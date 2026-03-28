import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import {
  Sparkles,
  Wand2,
  Zap,
  Image as ImageIcon,
  Palette,
  Stars,
  Layers,
  Rocket,
  Shield,
  Users,
  ArrowRight,
  Check,
  Aperture,
  Cpu,
} from "lucide-react";
import { motion } from "framer-motion";
import NextLink from "next/link";

export default function IndexNew2() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-[#0a0118] text-white overflow-hidden relative">
      {/* 动态网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* 渐变光晕 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-pink-600/25 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-32 pb-24">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          {/* 顶部标签 */}
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-white/10 backdrop-blur-xl mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
              AI 驱动的下一代图片处理平台
            </span>
          </motion.div>

          {/* 主标题 */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tight">
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              artImg Pro
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 leading-relaxed max-w-4xl mx-auto">
            用 AI 的力量，将你的想象变为现实
          </p>
          <p className="text-lg md:text-xl text-purple-300/80 mb-12">
            秒级生成 · 无限创意 · 专业品质
          </p>

          {/* CTA 按钮 */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-4 justify-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button
              as={NextLink}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold px-10 py-7 text-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 border border-white/10"
              href="/create"
              size="lg"
              startContent={<Wand2 className="w-5 h-5" />}
            >
              开始创作
            </Button>
            <Button
              as={NextLink}
              className="bg-white/5 backdrop-blur-xl border border-white/10 text-white font-semibold px-10 py-7 text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              href="/gallery"
              size="lg"
              startContent={<Stars className="w-5 h-5" />}
            >
              探索作品
            </Button>
          </motion.div>

          {/* 玻璃态统计卡片 */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <GlassCard
              icon={<Users className="w-6 h-6" />}
              label="活跃用户"
              number="50K+"
            />
            <GlassCard
              icon={<ImageIcon className="w-6 h-6" />}
              label="生成图片"
              number="1M+"
            />
            <GlassCard
              icon={<Zap className="w-6 h-6" />}
              label="服务可用率"
              number="99.9%"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-6 py-24">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          <Chip className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10 backdrop-blur-xl text-purple-300">
            核心能力
          </Chip>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            强大功能
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            专业级 AI 图像生成工具，满足你的所有创作需求
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          <FeatureCard
            delay={0}
            description="先进的 AI 算法，秒级完成高质量图片生成"
            gradient="from-yellow-500/20 to-orange-500/20"
            icon={<Zap className="w-8 h-8" />}
            title="闪电生成"
          />
          <FeatureCard
            delay={0.2}
            description="支持多种艺术风格，从写实到抽象应有尽有"
            gradient="from-purple-500/20 to-pink-500/20"
            icon={<Palette className="w-8 h-8" />}
            title="风格多样"
          />
          <FeatureCard
            delay={0.4}
            description="4K 高清输出，满足专业设计需求"
            gradient="from-blue-500/20 to-cyan-500/20"
            icon={<Aperture className="w-8 h-8" />}
            title="专业品质"
          />
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative container mx-auto px-6 py-24 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          <Chip className="mb-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/10 backdrop-blur-xl text-blue-300">
            使用流程
          </Chip>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
            如何使用
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            三步即可创建令人惊艳的 AI 图片
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <StepCard
            delay={0}
            description="用文字描述你想要的图片，越详细效果越好"
            icon={<Wand2 className="w-10 h-10" />}
            step="01"
            title="输入描述"
          />
          <StepCard
            delay={0.2}
            description="我们的 AI 引擎会在几秒内生成高质量图片"
            icon={<Cpu className="w-10 h-10" />}
            step="02"
            title="AI 生成"
          />
          <StepCard
            delay={0.4}
            description="下载你的作品，用于任何商业或个人项目"
            icon={<Rocket className="w-10 h-10" />}
            step="03"
            title="下载使用"
          />
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative container mx-auto px-6 py-24">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          <Chip className="mb-6 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-white/10 backdrop-blur-xl text-pink-300">
            应用场景
          </Chip>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
            无限可能
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            适用于各种创意和商业场景
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UseCaseCard
            delay={0}
            description="为你的社交账号创建吸睛的视觉内容"
            icon={<Layers className="w-8 h-8" />}
            title="社交媒体"
          />
          <UseCaseCard
            delay={0.1}
            description="快速生成品牌视觉素材和营销物料"
            icon={<Palette className="w-8 h-8" />}
            title="品牌设计"
          />
          <UseCaseCard
            delay={0.2}
            description="为产品创建专业的展示图和场景图"
            icon={<ImageIcon className="w-8 h-8" />}
            title="产品展示"
          />
          <UseCaseCard
            delay={0.3}
            description="为博客、文章配图，提升内容质量"
            icon={<Users className="w-8 h-8" />}
            title="内容创作"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-blue-900/30 border border-white/10 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            <CardBody className="relative p-12 md:p-16 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                whileInView={{ scale: 1 }}
              >
                <Shield className="w-20 h-20 mx-auto mb-8 text-purple-400" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                准备好开始创作了吗？
              </h2>
              <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                加入数万创作者，用 AI 释放你的创造力
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Input
                  className="max-w-md"
                  classNames={{
                    input: "bg-white/5 text-white backdrop-blur-xl",
                    inputWrapper:
                      "bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10",
                  }}
                  placeholder="输入你的邮箱"
                  size="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold px-10 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
                  endContent={<ArrowRight className="w-5 h-5" />}
                  size="lg"
                >
                  免费开始
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>无需信用卡</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>免费试用</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>随时取消</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative container mx-auto px-6 py-12 border-t border-white/10">
        <div className="text-center text-gray-400">
          <p>© 2024 artImg Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// 玻璃态统计卡片组件
interface GlassCardProps {
  number: string;
  label: string;
  icon: React.ReactNode;
}

function GlassCard({ number, label, icon }: GlassCardProps) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, scale: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="text-purple-400">{icon}</div>
        </div>
        <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          {number}
        </div>
        <div className="text-gray-400 text-sm">{label}</div>
      </div>
    </motion.div>
  );
}

// 特性卡片组件
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay,
}: FeatureCardProps) {
  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 30 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 h-full">
        <CardBody className="p-8 text-center">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} mb-6 text-white group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
          <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// 步骤卡片组件
interface StepCardProps {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function StepCard({ step, icon, title, description, delay }: StepCardProps) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="absolute -top-6 -left-6 text-8xl font-black text-purple-500/5 group-hover:text-purple-500/10 transition-colors duration-300">
        {step}
      </div>
      <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 h-full">
        <CardBody className="p-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// 应用场景卡片组件
interface UseCaseCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function UseCaseCard({ icon, title, description, delay }: UseCaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 h-full group cursor-pointer">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
              <p className="text-gray-400 leading-relaxed">{description}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

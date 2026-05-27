import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Chip } from "@heroui/chip";
import { CircleHelp, Sparkles, Layers } from "lucide-react";

import TopNavbar from "@/components/TopNavbar";
import Footer from "@/components/Footer";
import { Head } from "@/layouts/head";
import { faqItemsData } from "@/data/homepage-content";

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Head />
      <TopNavbar />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pt-40">
        <section className="mb-8 text-center lg:mb-12">
          <Chip
            className="mb-4 border border-blue-300/25 bg-blue-400/10 text-blue-200"
            startContent={<CircleHelp className="h-3.5 w-3.5" />}
            variant="flat"
          >
            常见问题
          </Chip>
          <h1 className="mb-4 text-3xl font-bold text-white lg:text-5xl">
            AI 图片创作常见问题
          </h1>
          <p className="mx-auto max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
            {
              "这里整理了 ArtImg Pro 在图像生成、商用授权、提示词优化和工作流实践中的核心问题，"
            }
            {"帮你快速上手并提高出图效率。"}
          </p>
        </section>

        <section className="mb-8 grid gap-4 lg:mb-10 lg:grid-cols-2">
          <Card className="border border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-base font-semibold text-white">
                <Sparkles className="h-4 w-4 text-blue-300" />
                快速开始创作
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="mb-4 text-sm leading-7 text-white/65">
                直接进入创作台，选择模型并输入清晰提示词，即可开始生成高质量图像。
              </p>
              <Button
                as={NextLink}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 font-semibold text-white"
                href="/"
                size="sm"
              >
                去创作页
              </Button>
            </CardBody>
          </Card>

          <Card className="border border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-base font-semibold text-white">
                <Layers className="h-4 w-4 text-emerald-300" />
                更多功能介绍
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="mb-4 text-sm leading-7 text-white/65">
                {
                  "查看能力总览、画廊展示和定价方案，了解 ArtImg Pro 的完整工作流能力。"
                }
              </p>
              <Button
                as={NextLink}
                className="border-white/20 text-white/90"
                href="/features"
                size="sm"
                variant="bordered"
              >
                查看功能页
              </Button>
            </CardBody>
          </Card>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 lg:p-8">
          <Accordion
            itemClasses={{
              base: "rounded-2xl border border-white/10 bg-white/[0.02] px-2 sm:px-4",
              title: "text-white text-sm sm:text-base",
              content: "text-white/70 text-sm leading-7 pb-4",
              trigger: "py-4",
            }}
            selectionMode="multiple"
            variant="splitted"
          >
            {faqItemsData.map((item) => (
              <AccordionItem key={item.key} title={item.question}>
                {item.answer}
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <Footer />
    </div>
  );
}

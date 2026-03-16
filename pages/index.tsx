import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

import DefaultLayout from "@/layouts/default";
import {
  SparklesIcon,
  PlayIcon,
  ExpandIcon,
  ArchiveIcon,
  StarIcon,
} from "@/components/icons";

// 动画配置
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export default function IndexPage() {
  const { t } = useTranslation('common');

  return (
    <DefaultLayout fullWidth>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3b82f6]/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-[#a855f7]/20 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <Chip
            className="mb-6 animate-pulse"
            color="primary"
            startContent={<SparklesIcon size={16} />}
            variant="bordered"
          >
            {t('hero.badge')}
          </Chip>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
            {t('hero.title')}
            <br />
            <span className="gradient-text">{t('hero.subtitle')}</span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10">
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              className="w-full sm:w-auto"
              color="default"
              radius="lg"
              size="lg"
              variant="solid"
            >
              {t('hero.cta_start')}
            </Button>
            <Button
              className="w-full sm:w-auto glass-effect"
              radius="lg"
              size="lg"
              startContent={<PlayIcon size={20} />}
              variant="bordered"
            >
              {t('hero.cta_demo')}
            </Button>
          </div>

          {/* Hero Image - Before/After Comparison */}
          <div className="relative max-w-5xl mx-auto rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass-effect p-2">
            <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden">
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=50"
                    alt={t('showcase.before')}
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"
                    alt={t('showcase.after')}
                  />
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 - AI Upscaling */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              variants={fadeInUp}
            >
              <Card
                className="bg-[#161616] border border-white/5 hover:border-[#3b82f6]/50 transition-all group h-full"
                shadow="none"
              >
              <CardBody className="p-8">
                <div className="w-12 h-12 bg-[#3b82f6]/10 rounded-xl flex items-center justify-center text-[#3b82f6] mb-6 group-hover:scale-110 transition-transform">
                  <ExpandIcon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t('tools.upscale.title')}</h3>
                <p className="text-slate-400">
                  {t('tools.upscale.description')}
                </p>
              </CardBody>
            </Card>
            </motion.div>

            {/* Feature Card 2 - Background Removal */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              variants={fadeInUp}
            >
              <Card
                className="bg-[#161616] border border-white/5 hover:border-[#a855f7]/50 transition-all group h-full"
                shadow="none"
              >
              <CardBody className="p-8">
                <div className="w-12 h-12 bg-[#a855f7]/10 rounded-xl flex items-center justify-center text-[#a855f7] mb-6 group-hover:scale-110 transition-transform">
                  <ArchiveIcon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t('tools.remove_bg.title')}</h3>
                <p className="text-slate-400">
                  {t('tools.remove_bg.description')}
                </p>
              </CardBody>
            </Card>
            </motion.div>

            {/* Feature Card 3 - Noise Reduction */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              variants={fadeInUp}
            >
              <Card
                className="bg-[#161616] border border-white/5 hover:border-[#06b6d4]/50 transition-all group h-full"
                shadow="none"
              >
              <CardBody className="p-8">
                <div className="w-12 h-12 bg-[#06b6d4]/10 rounded-xl flex items-center justify-center text-[#06b6d4] mb-6 group-hover:scale-110 transition-transform">
                  <SparklesIcon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t('tools.denoise.title')}</h3>
                <p className="text-slate-400">
                  {t('tools.denoise.description')}
                </p>
              </CardBody>
            </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-[#0a0a0a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('workflow.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-[#3b82f6]/20 via-[#a855f7]/20 to-[#3b82f6]/20 -z-10" />

            {/* Step 1 */}
            <motion.div
              className="text-center group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              variants={fadeInUp}
            >
              <div className="w-16 h-16 mx-auto bg-[#0a0a0a] border-4 border-[#3b82f6] rounded-full flex items-center justify-center text-2xl font-black text-white mb-6 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t('workflow.upload.title')}</h4>
              <p className="text-slate-400">
                {t('workflow.upload.description')}
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="text-center group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              variants={fadeInUp}
            >
              <div className="w-16 h-16 mx-auto bg-[#0a0a0a] border-4 border-[#a855f7] rounded-full flex items-center justify-center text-2xl font-black text-white mb-6 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t('workflow.enhance.title')}</h4>
              <p className="text-slate-400">
                {t('workflow.enhance.description')}
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="text-center group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              variants={fadeInUp}
            >
              <div className="w-16 h-16 mx-auto bg-[#0a0a0a] border-4 border-[#06b6d4] rounded-full flex items-center justify-center text-2xl font-black text-white mb-6 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t('workflow.download.title')}</h4>
              <p className="text-slate-400">
                {t('workflow.download.description')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-slate-400 text-lg">
              {t('testimonials.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              variants={fadeInUp}
            >
              <Card className="glass-effect h-full" shadow="none">
              <CardBody className="p-6">
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} size={16} />
                  ))}
                </div>
                <p className="text-slate-300 italic mb-6">
                  &ldquo;{t('testimonials.user1.content')}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t('testimonials.user1.name')}</p>
                    <p className="text-xs text-slate-500">{t('testimonials.user1.role')}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              variants={fadeInUp}
            >
              <Card className="glass-effect h-full" shadow="none">
              <CardBody className="p-6">
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} size={16} />
                  ))}
                </div>
                <p className="text-slate-300 italic mb-6">
                  &ldquo;{t('testimonials.user2.content')}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                    SK
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t('testimonials.user2.name')}</p>
                    <p className="text-xs text-slate-500">{t('testimonials.user2.role')}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              variants={fadeInUp}
            >
              <Card className="glass-effect h-full" shadow="none">
              <CardBody className="p-6">
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} size={16} />
                  ))}
                </div>
                <p className="text-slate-300 italic mb-6">
                  &ldquo;{t('testimonials.user3.content')}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                    RM
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t('testimonials.user3.name')}</p>
                    <p className="text-xs text-slate-500">{t('testimonials.user3.role')}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-5xl mx-auto bg-gradient-to-br from-[#3b82f6]/20 to-[#a855f7]/20 rounded-[2.5rem] p-12 text-center border border-white/10 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          variants={fadeInScale}
        >
          {/* Floating shapes */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#3b82f6]/10 blur-[80px] rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#a855f7]/10 blur-[80px] rounded-full" />

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
            {t('cta.title')}
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto relative z-10">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button color="default" radius="lg" size="lg" variant="solid">
              {t('cta.start_trial')}
            </Button>
            <Button
              className="glass-effect"
              radius="lg"
              size="lg"
              variant="bordered"
            >
              {t('cta.contact_sales')}
            </Button>
          </div>
        </motion.div>
      </section>
    </DefaultLayout>
  );
}

/**
 * 获取静态属性，加载国际化翻译
 */
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'zh', ['common'], {
        i18n: {
          defaultLocale: 'zh',
          locales: ['zh', 'en'],
        },
      })),
    },
  };
};

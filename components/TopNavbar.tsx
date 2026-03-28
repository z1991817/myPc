import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { useDisclosure } from "@heroui/modal";
import {
  Coins,
  DollarSign,
  FolderOpen,
  Image as ImageIcon,
  LogIn,
  LogOut,
  Sparkles,
  User,
  WalletCards,
} from "lucide-react";

import LoginModal from "@/components/LoginModal";
import { Logo } from "@/components/icons";
import { useUserStore } from "@/store/useUserStore";

const navItems = [
  { label: "画廊", href: "/gallery", icon: ImageIcon },
  { label: "AI 图像", href: "/createNew", icon: Sparkles },
  { label: "价格", href: "/#pricing", icon: DollarSign },
  { label: "收银台", href: "/checkout", icon: WalletCards },
];

const TopNavbar: React.FC = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const [hydrated, setHydrated] = useState(false);
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing");

    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth", block: "start" });

      return;
    }

    router.push("/#pricing");
  };

  const displayName = hydrated
    ? user?.nickname || user?.name || user?.username || user?.email || null
    : null;
  const rawPoints = hydrated
    ? (user?.points ??
      user?.credits ??
      user?.balance ??
      user?.coin ??
      user?.coins ??
      user?.score)
    : null;
  const pointsValue =
    rawPoints === null || rawPoints === undefined || rawPoints === ""
      ? null
      : Number(rawPoints);
  const pointsLabel =
    pointsValue !== null && Number.isFinite(pointsValue)
      ? new Intl.NumberFormat("zh-CN").format(pointsValue)
      : typeof rawPoints === "string"
        ? rawPoints
        : null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#08111f]/80 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-8 px-4 py-3 sm:px-6 lg:px-8">
            <NextLink
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
              href="/"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20">
                <Logo size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">
                  Nano Banana
                </p>
                <p className="text-xs text-white/40">AI Image Production</p>
              </div>
            </NextLink>

            <nav className="hidden items-center gap-2 lg:flex">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Button
                    key={item.href}
                    className="group relative overflow-hidden border-white/15 bg-white/[0.03] text-sm text-white/75 transition-all duration-300 hover:scale-105 hover:border-blue-400/50 hover:bg-white/6 hover:text-white hover:shadow-lg hover:shadow-blue-500/20"
                    radius="full"
                    size="sm"
                    startContent={
                      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    }
                    variant="bordered"
                    {...(item.href === "/#pricing"
                      ? { onPress: scrollToPricing }
                      : { as: NextLink, href: item.href })}
                  >
                    <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                    <span
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-purple-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        padding: "1px",
                        WebkitMask:
                          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      }}
                    />
                    <span className="relative z-10">{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              {displayName ? (
                <Dropdown placement="bottom-end" shouldBlockScroll={false}>
                  <DropdownTrigger>
                    <div className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-400/50 hover:bg-white/10 hover:shadow-blue-500/20">
                      {pointsLabel ? (
                        <div className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-gradient-to-r from-amber-400/18 via-yellow-300/18 to-orange-400/18 px-2.5 py-1 text-xs font-semibold text-amber-100">
                          <Coins className="h-3.5 w-3.5 text-amber-300" />
                          <span className="tabular-nums">{pointsLabel}</span>
                        </div>
                      ) : null}
                      <User className="h-4 w-4 shrink-0" />
                      <span>{displayName}</span>
                    </div>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="user-menu"
                    className="w-56"
                    itemClasses={{ base: "gap-2" }}
                  >
                    <DropdownItem
                      key="profile-info"
                      isReadOnly
                      className="cursor-default opacity-100"
                    >
                      <div className="flex items-center gap-2 pb-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium leading-none text-foreground">
                            {displayName}
                          </p>
                          {user?.email ? (
                            <p className="text-xs leading-none text-foreground/50">
                              {user.email}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </DropdownItem>
                    <DropdownItem
                      key="divider"
                      isReadOnly
                      className="h-px bg-divider p-0 opacity-100"
                    />

                    <DropdownItem
                      key="gallery-mobile"
                      className="py-3 lg:hidden"
                      startContent={<ImageIcon className="h-4 w-4" />}
                      onPress={() => router.push("/gallery")}
                    >
                      画廊
                    </DropdownItem>
                    <DropdownItem
                      key="create-mobile"
                      className="py-3 lg:hidden"
                      startContent={<Sparkles className="h-4 w-4" />}
                      onPress={() => router.push("/createNew")}
                    >
                      AI 图像
                    </DropdownItem>
                    <DropdownItem
                      key="pricing-mobile"
                      className="py-3 lg:hidden"
                      startContent={<DollarSign className="h-4 w-4" />}
                      onPress={scrollToPricing}
                    >
                      价格
                    </DropdownItem>
                    <DropdownItem
                      key="checkout-mobile"
                      className="py-3 lg:hidden"
                      startContent={<WalletCards className="h-4 w-4" />}
                      onPress={() => router.push("/checkout")}
                    >
                      收银台
                    </DropdownItem>
                    <DropdownItem
                      key="divider-mobile"
                      isReadOnly
                      className="h-px bg-divider p-0 opacity-100 lg:hidden"
                    />

                    <DropdownItem
                      key="my-creations"
                      className="py-3"
                      startContent={<FolderOpen className="h-4 w-4" />}
                      onPress={() => router.push("/my-creations")}
                    >
                      我的创作
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      className="py-3 text-danger"
                      color="danger"
                      startContent={<LogOut className="h-4 w-4" />}
                      onPress={() => {
                        clearUser();
                        router.push("/login");
                      }}
                    >
                      退出登录
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-500 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
                  radius="full"
                  size="sm"
                  startContent={<LogIn className="h-4 w-4" />}
                  onPress={onLoginOpen}
                >
                  登录
                </Button>
              )}
            </div>
          </div>

          <div className="border-t border-white/8 px-4 py-3 sm:px-6 lg:hidden">
            <nav className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Button
                    key={`mobile-${item.href}`}
                    className="shrink-0 border-white/12 bg-white/[0.03] text-sm text-white/75"
                    radius="full"
                    size="sm"
                    startContent={<Icon className="h-4 w-4" />}
                    variant="bordered"
                    {...(item.href === "/#pricing"
                      ? { onPress: scrollToPricing }
                      : { as: NextLink, href: item.href })}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
    </>
  );
};

export default TopNavbar;

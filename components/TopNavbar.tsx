import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Button } from "@heroui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from "@heroui/drawer";
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
  Menu,
  ReceiptText,
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
  const {
    isOpen: isMobileMenuOpen,
    onOpen: onMobileMenuOpen,
    onClose: onMobileMenuClose,
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

    void router.push("/#pricing");
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

  const handleNavigate = (href: string) => {
    onMobileMenuClose();

    if (href === "/#pricing") {
      scrollToPricing();

      return;
    }

    void router.push(href);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#08111f]/80 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-8 px-4 py-3 sm:px-6 lg:px-8">
            <NextLink
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
              href="/"
            >
              <div className="flex ">
                <img
                  alt="ArtImg logo candidate"
                  className="h-11 w-11 rounded-2xl "
                  src="/image/artimg-icon.svg"
                />
                {/* <div className="hidden h-7 w-px bg-white/10 sm:block" />
                <div className="relative hidden sm:block"> */}

                {/* <span className="absolute -right-1.5 -top-1.5 rounded-full border border-sky-300/30 bg-[#08111f] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                    New
                  </span> */}
                {/* </div> */}
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">
                  ArtImg Pro
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

            <div className="ml-auto hidden items-center gap-2 lg:flex">
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
                      key="my-orders"
                      className="py-3"
                      startContent={<ReceiptText className="h-4 w-4" />}
                      onPress={() => void router.push("/my-orders")}
                    >
                      我的订单
                    </DropdownItem>
                    <DropdownItem
                      key="my-creations"
                      className="py-3"
                      startContent={<FolderOpen className="h-4 w-4" />}
                      onPress={() => void router.push("/my-creations")}
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
                        void router.push("/login");
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

            <div className="ml-auto flex items-center lg:hidden">
              <Button
                isIconOnly
                aria-label="打开菜单"
                className="border border-white/15 bg-white/[0.04] text-white shadow-lg shadow-black/20 transition-all duration-300 hover:border-blue-400/50 hover:bg-white/10"
                radius="full"
                variant="bordered"
                onPress={onMobileMenuOpen}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />

      <Drawer
        hideCloseButton
        isOpen={isMobileMenuOpen}
        placement="right"
        shouldBlockScroll={false}
        size="xs"
        onClose={onMobileMenuClose}
      >
        <DrawerContent className="border-l border-white/10 bg-[#07101d] text-white">
          <DrawerHeader className="border-b border-white/10 px-5 py-5">
            <div className="flex w-full items-center justify-between gap-3">
              <div>
                {/* <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Navigation
                </p> */}
                <p className="mt-1 text-lg font-semibold text-white">
                  ArtImg Pro
                </p>
              </div>
              <Button
                isIconOnly
                aria-label="关闭菜单"
                className="border border-white/10 bg-white/5 text-white/80"
                radius="full"
                variant="bordered"
                onPress={onMobileMenuClose}
              >
                <span className="text-lg leading-none">x</span>
              </Button>
            </div>
          </DrawerHeader>

          <DrawerBody className="px-5 py-5">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Button
                    key={`drawer-${item.href}`}
                    className="justify-start border-white/10 bg-white/[0.03] px-4 text-left text-white/85 hover:border-blue-400/40 hover:bg-blue-500/10"
                    radius="lg"
                    size="lg"
                    startContent={<Icon className="h-4 w-4" />}
                    variant="bordered"
                    onPress={() => handleNavigate(item.href)}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              {displayName ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {displayName}
                      </p>
                      {user?.email ? (
                        <p className="mt-1 truncate text-xs text-white/45">
                          {user.email}
                        </p>
                      ) : null}
                      {pointsLabel ? (
                        <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-gradient-to-r from-amber-400/18 via-yellow-300/18 to-orange-400/18 px-2.5 py-1 text-xs font-semibold text-amber-100">
                          <Coins className="h-3.5 w-3.5 text-amber-300" />
                          <span className="tabular-nums">{pointsLabel}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      className="justify-start border-white/10 bg-white/[0.03] text-white/85"
                      radius="lg"
                      startContent={<ReceiptText className="h-4 w-4" />}
                      variant="bordered"
                      onPress={() => handleNavigate("/my-orders")}
                    >
                      我的订单
                    </Button>
                    <Button
                      className="justify-start border-white/10 bg-white/[0.03] text-white/85"
                      radius="lg"
                      startContent={<FolderOpen className="h-4 w-4" />}
                      variant="bordered"
                      onPress={() => handleNavigate("/my-creations")}
                    >
                      我的创作
                    </Button>
                    <Button
                      className="justify-start border-danger/30 bg-danger/10 text-danger"
                      radius="lg"
                      startContent={<LogOut className="h-4 w-4" />}
                      variant="bordered"
                      onPress={() => {
                        clearUser();
                        onMobileMenuClose();
                        void router.push("/login");
                      }}
                    >
                      退出登录
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      登录后继续创作
                    </p>
                    <p className="mt-1 text-xs leading-6 text-white/45">
                      登录后可查看订单、管理创作记录并同步账户积分。
                    </p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 font-semibold text-white shadow-lg shadow-blue-500/20"
                    radius="lg"
                    startContent={<LogIn className="h-4 w-4" />}
                    onPress={() => {
                      onMobileMenuClose();
                      onLoginOpen();
                    }}
                  >
                    登录
                  </Button>
                </div>
              )}
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default TopNavbar;

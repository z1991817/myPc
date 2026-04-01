import { useRouter } from "next/router";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

/**
 * 语言切换组件
 * 支持中文和英文切换
 */
export const LanguageSwitcher = () => {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;

  /**
   * 切换语言
   * @param newLocale - 新的语言代码
   */
  const changeLanguage = (newLocale: string) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  const languages = [
    { key: "zh", label: "中文", flag: "🇨🇳" },
    { key: "en", label: "English", flag: "🇺🇸" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.key === locale) || languages[0];

  return (
    <Dropdown shouldBlockScroll={false}>
      <DropdownTrigger>
        <Button size="sm" variant="bordered">
          <span className="mr-1">{currentLanguage.flag}</span>
          {currentLanguage.label}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language selection"
        onAction={(key) => changeLanguage(key as string)}
      >
        {languages.map((lang) => (
          <DropdownItem key={lang.key} startContent={<span>{lang.flag}</span>}>
            {lang.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

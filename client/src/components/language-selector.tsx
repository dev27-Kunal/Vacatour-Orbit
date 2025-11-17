import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";

const languages = [
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export function LanguageSelector() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguageContext();

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
          data-testid="button-language-selector"
          title={t("navigation.languageSelector")}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLang.flag} {currentLang.name}
          </span>
          <span className="sm:hidden">
            {currentLang.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer ${
              currentLanguage === language.code ? "bg-primary/10" : ""
            }`}
            data-testid={`language-option-${language.code}`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

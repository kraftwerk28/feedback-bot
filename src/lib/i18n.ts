import { resolve } from 'path'
import { readFileSync } from 'fs'
import { safeLoad } from 'js-yaml'

type LangToken = 'uk' | 'en' | 'ru'
type I18nMap = Record<string, string>

interface Ii18n {
  replies: Record<LangToken, I18nMap>;
}

const i18n: Ii18n = safeLoad(readFileSync(
  resolve('localization.yml'),
  { encoding: 'utf8' }
))

export const fromLang = (localization: LangToken) =>
  (token: string): string | undefined =>
    i18n.replies[localization][token]

/** Read-only contract data. Components own the values; consumers do not override tokens. */
export const typography = Object.freeze({
  sidebarProfile: { size: 14, line: 21, weight: 400, tracking: -.15, evidence: 'A' },
  sidebarItem: { size: 14, line: 19.6, weight: 400, tracking: -.1, evidence: 'A' },
  sidebarSection: { size: 12, line: 18, weight: 400, tracking: -.1, evidence: 'A' },
  pageTitle: { size: 16, line: 20, weight: 500, tracking: -.15, evidence: 'M' },
  sectionTitle: { size: 13, line: 20, weight: 500, tracking: -.1, evidence: 'M' },
  chatTitle: { size: 16, line: 24, weight: 500, tracking: -.15, evidence: 'M' },
  label: { size: 13, line: 16, weight: 500, tracking: -.1, evidence: 'M' },
  option: { size: 13, line: 16, weight: 450, tracking: -.1, evidence: 'M' },
  body: { size: 14, line: 21, weight: 400, tracking: -.1, evidence: 'D' },
  bodySmall: { size: 13, line: 20, weight: 400, tracking: -.1, evidence: 'M' },
  chat: { size: 14, line: 22.4, weight: 400, tracking: -.15, evidence: 'M' },
  field: { size: 13, line: 20, weight: 400, tracking: -.1, evidence: 'M' },
  caption: { size: 12, line: 16, weight: 400, tracking: 0, evidence: 'A' },
  overline: { size: 12, line: 16, weight: 500, tracking: .55, evidence: 'A' },
  command: { size: 15, line: 24, weight: 400, tracking: -.1, evidence: 'M' },
});
export const geometry = Object.freeze({
  navRow: 31, navGap: 0, navIcon: 16, navLabelGap: 11, navInset: 12,
  sidebarProfile: 40, sidebarActionWidth: 32, sidebarSectionGap: 17, primaryNavRow: 40, primaryNavPill: 31, primaryNavGap: 4,
  button: 32, compactButton: 28, field: 36, search: 32, switchWidth: 32, switchHeight: 18.4,
  accountMenu: 280, choiceMenu: 260, periodMenu: 160, command: 672,
  readingWidth: 640, composerRadius: 20, composerInput: 120, agentStrip: 36,
  panelRadius: 20, panelPadding: 16, cardRadius: 24, cardPadding: 20,
  featureCardWidth: 360, featureCardImageInset: 8, featureCardImageRadius: 16,
  suggestionRow: 40, suggestionTile: 24, integrationRow: 64, sectionGap: 48,
  creditSegments: 28, creditHeight: 16, creditGap: 2, creditRadius: 2,
});
export const neutrals = Object.freeze({
  0: '#ffffff', 50: '#fbfaf9', 100: '#f6f5f4', 200: '#edece9', 300: '#e6e4e0',
  400: '#dbd8d2', 500: '#a49e97', 600: '#787775', 700: '#504b49', 800: '#37352e',
  850: '#2a2928', 900: '#202020', 950: '#191919', 1000: '#000000',
});
export const themes = Object.freeze({
  light: { bg: '#ffffff', sidebar: '#fbfaf9', surface: '#ffffff', subtle: '#edece9', raised: '#edece9', hover: '#e6e4e0', pressed: '#dbd8d2', text: '#37352e', secondary: '#6a6966', placeholder: '#6a6966', inverse: '#191919', border: '#00000014', borderSubtle: '#0000000f', borderStrong: '#0000001f', controlBorder: '#787775', errorText: '#c52a2a', primary: '#202020', onPrimary: '#ffffff' },
  dark: { bg: '#191919', sidebar: '#191919', surface: '#202020', subtle: '#232323', raised: '#272727', hover: '#ffffff05', pressed: '#ffffff0c', text: '#cecece', secondary: '#949494', placeholder: '#949494', inverse: '#f1f1f1', border: '#ffffff0c', borderSubtle: '#ffffff06', borderStrong: '#ffffff13', controlBorder: '#858585', errorText: '#ff7b7b', primary: '#f1f1f1', onPrimary: '#242424' },
});

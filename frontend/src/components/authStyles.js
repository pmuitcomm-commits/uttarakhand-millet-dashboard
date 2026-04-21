export const authInputBase =
  "w-full appearance-none rounded-[10px] border-[1.5px] border-[#d8d2c6] bg-white px-3 py-[9px] font-lato text-[0.88rem] text-[#1a2b1e] outline-none transition duration-200 placeholder:text-[#a8a099] focus:border-[#024b37] focus:bg-[#f7fbf9] focus:shadow-[0_0_0_3px_rgba(2,75,55,0.10)]";

export const authInputError = "border-[#d14343] bg-[#fff8f8]";

export const authClasses = {
  container:
    "flex h-screen w-screen flex-col overflow-hidden bg-[#024b37] font-lato text-white max-[1100px]:h-auto max-[1100px]:min-h-screen max-[1100px]:overflow-y-auto",
  topHeader:
    "flex w-full shrink-0 items-center justify-between gap-2.5 px-6 py-2.5 max-[1100px]:flex-wrap max-[1100px]:gap-2 max-[640px]:px-3.5",
  headerLeft: "flex shrink-0 items-center gap-2",
  headerLogo: "h-[42px] w-auto object-contain",
  headerLogoBlend: "mix-blend-darken",
  headerSeparator: "mx-0.5 text-[1.3rem] font-light text-white/40",
  headerCenter:
    "flex flex-1 items-center justify-center max-[1100px]:order-3 max-[1100px]:w-full",
  headerTitle: "text-center",
  headerEyebrow:
    "mb-[3px] block text-[0.78rem] tracking-[0.08em] text-white/85 max-[640px]:text-[0.7rem]",
  headerH1:
    "m-0 font-playfair text-[1.45rem] font-semibold tracking-[0.02em] text-white max-[640px]:text-[1.1rem]",
  headerRight:
    "flex shrink-0 flex-wrap items-center justify-end gap-2",
  headerButton:
    "whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-3.5 py-2 font-lato text-[0.82rem] font-bold tracking-[0.02em] text-white transition duration-200 hover:-translate-y-px hover:bg-[#d8800d] max-[640px]:px-[11px] max-[640px]:py-[7px] max-[640px]:text-[0.76rem]",
  heroContent:
    "flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-6 py-[18px] max-[1100px]:items-start max-[1100px]:overflow-visible max-[1100px]:p-4",
  pageCards:
    "grid h-full w-full max-w-[1320px] grid-cols-[minmax(0,1fr)_400px] items-center gap-[34px] max-[1100px]:h-auto max-[1100px]:grid-cols-1 max-[1100px]:gap-[18px]",
  leftPanel:
    "flex h-full min-w-0 items-center justify-start max-[1100px]:h-auto",
  notificationBox:
    "min-h-[320px] w-full max-w-[760px] rounded-3xl border border-white/10 bg-white/[0.08] px-[26px] py-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-[5px] max-[1100px]:min-h-0 max-[1100px]:max-w-full max-[640px]:rounded-[18px] max-[640px]:p-[18px]",
  notificationHeader:
    "mb-[18px] flex items-center justify-between gap-3",
  notificationTitle:
    "font-playfair text-[1.35rem] font-semibold text-white max-[640px]:text-[1.15rem]",
  liveBadge:
    "inline-flex items-center justify-center rounded-full border border-white/20 bg-[#d8800d]/20 px-3 py-1.5 text-[0.76rem] font-bold uppercase tracking-[0.04em] text-white",
  notificationMarquee:
    "relative h-[190px] overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.05] py-3.5 max-[1100px]:h-[150px]",
  notificationTrack: "flex animate-vertical-scroll flex-col gap-3.5",
  notificationItem:
    "flex items-start gap-2.5 px-[18px] text-[0.96rem] leading-normal text-white/95",
  notificationDot: "mt-[7px] h-2 w-2 shrink-0 rounded-full bg-[#d8800d]",
  loginCard:
    "flex max-h-full flex-col justify-center overflow-y-auto rounded-[20px] bg-white px-[26px] py-[22px] text-[#024b37] shadow-[0_8px_40px_rgba(0,0,0,0.18)] max-[1100px]:w-full max-[1100px]:max-w-[560px] max-[1100px]:justify-self-center max-[1100px]:max-h-none max-[640px]:max-w-full max-[640px]:rounded-2xl max-[640px]:px-[18px] max-[640px]:py-5",
  loginHeaderText:
    "mb-3.5 border-b-[1.5px] border-[#eae6de] pb-3.5 text-center",
  loginHeading:
    "mb-[5px] mt-0 font-playfair text-xl font-semibold text-[#024b37]",
  loginDescription: "m-0 text-center text-[0.84rem] text-[#5c6b5e]",
  roleSelector: "mb-5",
  roleLabel:
    "mb-[5px] block text-[0.76rem] font-bold uppercase tracking-[0.04em] text-[#2a3b2e]",
  loginForm: "flex flex-col gap-2.5",
  formGroup: "flex flex-col gap-[5px]",
  formLabel:
    "text-[0.76rem] font-bold uppercase tracking-[0.04em] text-[#2a3b2e]",
  errorBanner:
    "mb-2.5 animate-slide-down rounded-[10px] border border-[#d14343] bg-red-600/10 px-[13px] py-[9px] text-[0.84rem] font-bold text-[#8b1c1c]",
  errorText:
    "mt-1 block text-[0.76rem] font-bold text-[#c0392b]",
  loginButton:
    "mt-1.5 w-full cursor-pointer rounded-xl border-0 bg-[#024b37] px-5 py-[11px] font-lato text-[0.9rem] font-bold text-white shadow-[0_2px_8px_rgba(2,75,55,0.22)] transition duration-200 hover:-translate-y-px hover:bg-[#035e47] hover:shadow-[0_4px_14px_rgba(2,75,55,0.28)] active:translate-y-0 active:bg-[#023628] disabled:cursor-not-allowed disabled:bg-[#a8c4b4] disabled:shadow-none disabled:transform-none",
  loginFooter:
    "mt-2.5 flex flex-col items-center gap-[7px] border-t-[1.5px] border-[#eae6de] pt-3",
  registerToggle:
    "w-full cursor-pointer rounded-xl border-[1.5px] border-[#024b37] bg-transparent p-[9px] text-center font-lato text-[0.86rem] font-bold text-[#024b37] transition duration-200 hover:bg-[#024b37] hover:text-white",
  forgotLink:
    "cursor-pointer border-0 bg-transparent text-center font-lato text-[0.82rem] font-bold text-[#024b37] underline underline-offset-2 hover:text-[#035e47]",
  globalFooter:
    "flex w-full shrink-0 items-center justify-center px-0 py-2 text-[0.78rem] text-white/75",
  dropdownContainer: "relative flex items-center",
  dropdownMenu:
    "absolute right-0 top-full z-[1000] mt-2 max-h-[340px] min-w-[320px] max-w-[380px] overflow-y-auto rounded-xl border border-[#eae6de] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.14)] max-[640px]:right-[-20px] max-[640px]:min-w-[260px] max-[640px]:max-w-[90vw]",
  schemeItem:
    "flex items-center justify-between gap-2.5 border-b border-[#eae6de] px-3.5 py-2.5 transition duration-150 last:border-b-0 hover:bg-[#f3f9f6]",
  schemeName:
    "flex-1 text-[0.84rem] font-bold leading-tight text-[#1a2b1e]",
  pdfButton:
    "whitespace-nowrap rounded-md border-0 bg-[#024b37] px-2.5 py-[5px] font-lato text-[0.74rem] font-bold text-white transition duration-200 hover:bg-[#035e47]",
};

export const modalClasses = {
  overlay:
    "fixed inset-0 z-[1000] flex animate-fade-in items-center justify-center bg-black/60",
  content:
    "max-h-[90vh] w-[90%] max-w-[450px] animate-modal-slide-in overflow-y-auto rounded-xl bg-white shadow-modal max-[480px]:m-5 max-[480px]:w-[calc(100%-40px)]",
  header:
    "mb-6 flex items-center justify-between border-b border-[#e2e8f0] px-6 pb-0 pt-6 max-[480px]:px-5 max-[480px]:pt-5",
  title:
    "m-0 text-2xl font-bold text-[#003366] max-[480px]:text-[1.3rem]",
  closeButton:
    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-3xl text-[#718096] transition duration-200 hover:bg-[#f5f5f5] hover:text-[#003366]",
  body: "px-6 pb-6 pt-0 max-[480px]:px-5 max-[480px]:pb-5",
  description: "mb-6 mt-0 text-base leading-relaxed text-[#4a5568]",
  formGroup: "mb-5",
  label: "mb-2 block text-sm font-semibold text-[#024b37]",
  input:
    "w-full rounded-lg border-2 border-[#e2e8f0] px-4 py-3 text-base transition duration-300 focus:border-[#024b37] focus:outline-none focus:ring-4 focus:ring-[#024b37]/10",
  inputError: "border-[#c12f2f]",
  errorText: "mt-1 block text-sm font-medium text-[#c12f2f]",
  resetButton:
    "w-full cursor-pointer rounded-lg border-0 bg-gradient-to-r from-[#024b37] to-[#003366] px-5 py-3.5 text-lg font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(2,75,55,0.3)]",
  success: "py-5 text-center",
  successIcon: "mb-4 text-5xl",
  successTitle: "mb-4 mt-0 text-[1.4rem] font-bold text-[#003366]",
  successText: "mb-3 mt-0 leading-relaxed text-[#4a5568]",
  note: "text-sm italic text-[#718096]",
  closeSuccess:
    "mt-6 cursor-pointer rounded-lg border-0 bg-gradient-to-r from-[#024b37] to-[#003366] px-6 py-3 text-base font-semibold text-white transition duration-200 hover:-translate-y-px",
};

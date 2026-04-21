export const landingClasses = {
  container:
    "flex min-h-screen w-full flex-col items-center justify-between p-5 font-montserrat max-[480px]:p-2.5",
  header: "flex w-full max-w-[1200px] items-center justify-center py-5",
  logoSection: "flex items-center",
  logo: "h-[60px] w-auto object-contain max-[480px]:h-[50px]",
  content: "flex w-full max-w-[600px] flex-1 items-center justify-center",
  card:
    "min-w-[350px] animate-slide-up rounded-[15px] bg-white/95 px-10 py-[60px] text-center shadow-[0_10px_40px_rgba(0,0,0,0.2)] max-[768px]:min-w-full max-[768px]:px-[30px] max-[768px]:py-10 max-[480px]:px-5 max-[480px]:py-[30px]",
  greeting:
    "mb-2.5 bg-gradient-to-br from-[#024b37] to-[#0d5a3d] bg-clip-text text-4xl font-bold text-transparent max-[768px]:text-[28px] max-[480px]:text-2xl",
  welcomeMessage:
    "mb-[30px] text-lg font-medium text-[#555555] max-[768px]:text-base max-[480px]:text-sm",
  roleInfo: "my-5 rounded-[10px] border-l-4 p-5",
  roleDescription: "m-0 text-sm italic text-[#666666]",
  districtBlockName: "mt-2.5 text-base font-semibold text-[#024b37]",
  continueButton:
    "mt-5 cursor-pointer rounded-lg border-0 px-10 py-3 text-base font-semibold uppercase tracking-[0.5px] text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 max-[768px]:px-[30px] max-[768px]:py-2.5 max-[768px]:text-sm max-[480px]:px-[25px] max-[480px]:text-xs",
  autoRedirect: "mt-5 text-xs italic text-[#999999]",
  footer: "w-full p-5 text-center",
  footerText: "m-0 text-sm text-white/70",
};

export const landingVariants = {
  admin: {
    container: "bg-gradient-to-br from-[#024b37] to-[#013b2a]",
    roleInfo: "border-l-[#024b37] bg-gradient-to-br from-[#024b37]/10 to-[#0d5a3d]/10",
    button:
      "bg-gradient-to-br from-[#024b37] to-[#013b2a] hover:shadow-[0_5px_20px_rgba(2,75,55,0.4)]",
  },
  district: {
    container: "bg-gradient-to-br from-[#0d5a3d] to-[#024b37]",
    roleInfo: "border-l-[#0d5a3d] bg-gradient-to-br from-[#0d5a3d]/10 to-[#1a6b4f]/10",
    button:
      "bg-gradient-to-br from-[#0d5a3d] to-[#024b37] hover:shadow-[0_5px_20px_rgba(13,90,61,0.4)]",
  },
  block: {
    container: "bg-gradient-to-br from-[#1a6b4f] to-[#0d5a3d]",
    roleInfo: "border-l-[#1a6b4f] bg-gradient-to-br from-[#1a6b4f]/10 to-[#338a68]/10",
    button:
      "bg-gradient-to-br from-[#1a6b4f] to-[#0d5a3d] hover:shadow-[0_5px_20px_rgba(26,107,79,0.4)]",
  },
};

/**
 * Footer component module - Displays government ownership information.
 */

/**
 * Footer - Persistent footer for the Millet MIS application shell.
 *
 * @component
 * @returns {React.ReactElement} Government programme footer.
 */
function Footer() {
  return (
    <footer className="w-full shrink-0 overflow-x-hidden bg-[#024b37] px-3 py-3 text-center text-white/75 sm:px-4">
      <p className="m-0 mx-auto max-w-full break-words font-lato text-[0.74rem] leading-relaxed sm:text-[0.84rem]">
        Government of Uttarakhand, Department of Agriculture & Horticulture | Millet
        Development Programme
      </p>
    </footer>
  );
}

export default Footer;

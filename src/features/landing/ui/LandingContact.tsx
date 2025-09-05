export default function LandingContact() {
  return (
    <section id="contato" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Transforme sua Ideia em Realidade</h2>
        <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
          Pronto para encomendar uma peça personalizada ou tirar uma dúvida?
        </p>
        <div className="mt-8">
          <a
            href="https://wa.me/5500000000000?text=Ol%C3%A1!%20Gostaria%20de%20falar%20sobre%20um%20projeto%20personalizado."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg inline-block shadow-lg"
          >
            Fale Conosco no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

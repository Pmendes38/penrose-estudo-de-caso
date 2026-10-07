import Image from 'next/image';
import { Logo } from '@/shared/ui/Logo';

export default function StorefrontBenefits() {
  return (
    <>
      <div className="penrose-why-heading">
        <p>Por que comprar na</p>
        <Logo className="h-12 w-auto md:h-16" />
      </div>
      <div className="penrose-why-grid">
        <article className="penrose-why-card why-blue">
          <div className="penrose-why-card-panel">
            <Image src="/assets/penrose/payment.svg" alt="" width={150} height={150} unoptimized />
            <h3>Resgate<br />pontos com a<br />compra</h3>
          </div>
          <p>Transforme suas compras em recompensas.</p>
        </article>
        <article className="penrose-why-card why-green">
          <div className="penrose-why-card-panel">
            <Image src="/assets/penrose/bank.svg" alt="" width={150} height={150} unoptimized />
            <h3>Método<br />de pagamento<br />flexível</h3>
          </div>
          <p>Você decide a forma de pagamento.</p>
        </article>
        <article className="penrose-why-card why-pink">
          <div className="penrose-why-card-panel">
            <Image src="/assets/penrose/quality.svg" alt="" width={150} height={150} unoptimized />
            <h3>Qualidade<br />excepcional<br />nos produtos</h3>
          </div>
          <p>Acabamento impecável em cada peça.</p>
        </article>
      </div>
    </>
  );
}

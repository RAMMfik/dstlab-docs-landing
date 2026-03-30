import { ArrowRight, MessageCircle, Mail, Send, Phone } from "lucide-react";

export function CTA() {
  return (
    <section id="contact" className="pb-14 sm:pb-16 lg:pb-20">
      <div className="container">
        <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] p-6 text-white shadow-[0_25px_60px_rgba(10,99,117,0.22)] sm:rounded-[36px] sm:p-8 md:p-10 xl:p-12">
          <div className="grid items-start gap-8 xl:grid-cols-[1fr_0.9fr] xl:gap-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-cyan-50">
                <Send size={16} />
                Связаться с командой DSTLab
              </div>

              <h2 className="mt-6 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                Обсудим задачу и подберём подходящий сценарий работы с документами
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-cyan-50/90 sm:text-lg sm:leading-8">
                Подскажем, как использовать ИИ для проверки документов, извлечения данных,
                анализа коммерческих предложений, тендерных файлов, договоров и внутренних
                регламентов.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <a
                  href="https://t.me/icevan80"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-3xl bg-white/10 p-4 backdrop-blur transition duration-200 hover:bg-white/14"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                    <Send size={18} />
                  </div>
                  <div className="mt-3 text-sm font-semibold">Telegram</div>
                  <div className="mt-1 text-sm text-cyan-50/80">Написать в Telegram</div>
                </a>

                <a
                  href="https://web.whatsapp.com/send?phone=79139003752"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-3xl bg-white/10 p-4 backdrop-blur transition duration-200 hover:bg-white/14"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                    <MessageCircle size={18} />
                  </div>
                  <div className="mt-3 text-sm font-semibold">WhatsApp</div>
                  <div className="mt-1 text-sm text-cyan-50/80">Быстрая связь по задаче</div>
                </a>

                <a
                  href="mailto:info@dstlab.ru"
                  className="rounded-3xl bg-white/10 p-4 backdrop-blur transition duration-200 hover:bg-white/14"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                    <Mail size={18} />
                  </div>
                  <div className="mt-3 text-sm font-semibold">Почта</div>
                  <div className="mt-1 text-sm text-cyan-50/80">info@dstlab.ru</div>
                </a>

                <a
                  href="tel:+79537863291"
                  className="rounded-3xl bg-white/10 p-4 backdrop-blur transition duration-200 hover:bg-white/14"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                    <Phone size={18} />
                  </div>
                  <div className="mt-3 text-sm font-semibold">Телефон</div>
                  <div className="mt-1 text-sm text-cyan-50/80">+7 (953) 786 32 91</div>
                </a>
              </div>

              <div className="mt-8 rounded-[24px] bg-white/10 p-4 text-sm leading-7 text-cyan-50/90">
                <div className="font-semibold text-white">ООО «Акцепт Девелопмент»</div>
                <div className="mt-1">Сертифицированное маркетинговое агентство</div>
                <div className="mt-1">Новосибирск, ул. Кошурникова 45/1, офис 8</div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/12 p-5 backdrop-blur-xl sm:p-6">
              <div className="text-xl font-bold text-white">Оставить заявку</div>
              <p className="mt-2 text-sm leading-6 text-cyan-50/80">
                Заполните форму, и мы свяжемся с вами для обсуждения задачи.
              </p>

              <form className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="h-14 w-full rounded-full border border-white/20 bg-white/10 px-5 text-white outline-none transition placeholder:text-white/65 focus:bg-white/14"
                />
                <input
                  type="text"
                  placeholder="Телефон или почта"
                  className="h-14 w-full rounded-full border border-white/20 bg-white/10 px-5 text-white outline-none transition placeholder:text-white/65 focus:bg-white/14"
                />
                <textarea
                  placeholder="Коротко опишите задачу"
                  className="h-32 w-full resize-none rounded-[24px] border border-white/20 bg-white/10 px-5 py-4 text-white outline-none transition placeholder:text-white/65 focus:bg-white/14"
                />
                <button
                  type="submit"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-[#0A6375] transition duration-200 hover:bg-slate-100"
                >
                  Отправить заявку
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="mt-4 text-xs leading-6 text-cyan-50/75">
                Форму можно подключить к API, Telegram, почте или CRM.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
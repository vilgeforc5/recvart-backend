import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CommentService } from '../comment/comment.service';
import { ContactService } from '../contact/contact.service';
import { PortfolioService } from '../portfolio/portfolio.service';

const reviews = [
  {
    name: 'Олег',
    text: 'Огромная благодарность компании Рекварт за отличный, а главное качественный ремонт в нашей квартире! Сделали всё в оговоренные сроки, без лишней суеты. Материалы использовали те, о которых договаривались, никаких неприятных сюрпризов с бюджетом не было. Результатом более чем довольны, квартира преобразила все задумки в реальность! Однозначно рекомендую!',
    date: '2025-11-20',
  },
  {
    name: 'Семён',
    text: 'Я хотел бы оставить положительный отзыв о прорабе Владимире фирмы Рекварт, который осуществлял дизайнерский ремонт в моем доме. Его профессионализм и внимательное отношение к деталям проявились на каждом этапе проекта. Владимир всегда был на связи, делал качественную работу в срок и обеспечивал чистоту на площадке. Благодаря его опыту и ответственному подходу мой дом превзошел все ожидания. Искренне рекомендую его услуги всем, кто ищет надежного и талантливого специалиста для ремонта.',
    date: '2025-11-20',
  },
  {
    name: 'Андрей',
    text: 'Я остался очень доволен работой компании Рекварт! Благодаря их профессионализму и внимательному подходу мой ремонт в квартире прошёл быстро и без лишних хлопот. Мастера сделали всё качественно, учитывая все мои пожелания и сроки. Особенно поразила их аккуратность и ответственность. Результат превзошёл все ожидания! Ребята — настоящие профессионалы, которым можно доверять. Однозначно буду обращаться к ним и в будущем, а также рекомендую друзьям и знакомым. Спасибо за отличный ремонт и отличное настроение!',
    date: '2025-11-20',
  },
  {
    name: 'Тимофей',
    text: 'Отдельно хочу отметить пунктуальность и внимательное отношение к мелочам в компании Рекварт. В процессе ремонта возникали небольшие непредвиденные ситуации, но команда всегда быстро и грамотно их решала, что очень приятно и говорит о их ответственном подходе. В результате в нашей квартире создано идеально уютное и современное пространство, в котором чувствуешь себя комфортно. Благодаря профессионализму и добросовестности этой компании я получил именно тот результат, на который надеялся.',
    date: '2025-11-20',
  },
  {
    name: 'Дмитрий',
    text: 'Работа выполнена на высшем уровне — все материалы подобраны идеально, дизайн интерьера соответствовал моим желаниям, а качество исполнения оставляет только положительные впечатления. В процессе ремонта сотрудники Рекварт постоянно поддерживали связь, оперативно реагировали на любые мои вопросы и предложения.',
    date: '2025-11-20',
  },
];

const portfolioItems = [
  {
    title: 'Пушкино, Московская область',
    imageSrc:
      'https://rekvart.ru/upload/resize_cache/iblock/eac/555_345_2/b6lfzpwnd6d15d9ff110cz9xw200k74m.jpg',
    description:
      'Сложный проект загородного дома в Пушкино. Работали с неровными стенами и сложной планировкой, но благодаря нашему опыту и профессионализму удалось создать уютное пространство. Клиент остался в восторге от результата!',
  },
  {
    title: 'Кутузовский пр-т',
    imageSrc:
      'https://rekvart.ru/upload/resize_cache/iblock/5b5/555_345_2/ng1gch0ta6ka04fcnmrf3yf97kx8h091.jpg',
    description:
      'Ремонт квартиры на Кутузовском проспекте был непростым — требовалось учесть множество нюансов и пожеланий заказчика. Мы приложили максимум усилий, и результат превзошел все ожидания. Клиент очень доволен!',
  },
  {
    title: 'ЖК Доминион',
    imageSrc:
      'https://rekvart.ru/upload/resize_cache/iblock/741/555_345_2/xa68s45waglsdwelfj3sgmuxjegvl4w3.jpg',
    description:
      'Этот проект в ЖК Доминион оказался настоящим вызовом — сложная геометрия помещений и высокие требования к качеству. Но мы справились на отлично, и заказчик был в полном восторге от проделанной работы!',
  },
  {
    title: 'ЖК Матвеевский парк 77 кв.м',
    imageSrc:
      'https://rekvart.ru/upload/resize_cache/iblock/ee3/555_345_2/p10cz5u3k88bpftfh9kmzyxpoc0xasx1.jpg',
    description:
      'Компактная квартира 77 кв.м в ЖК Матвеевский парк требовала особого подхода к планировке. Было непросто, но мы нашли оптимальные решения и максимально эффективно использовали каждый метр. Клиент остался очень доволен результатом!',
  },
  {
    title: 'ЖК Зиларт 89 кв.м',
    imageSrc:
      'https://rekvart.ru/upload/resize_cache/iblock/50a/555_345_2/lvstsq578vy18wlisp9f3u55r6opoget.jpg',
    description:
      'Ремонт в ЖК Зиларт был сложным проектом с множеством технических нюансов. Столкнулись с различными вызовами, но благодаря нашему профессионализму и вниманию к деталям все было выполнено на высшем уровне. Заказчик в восторге!',
  },
  {
    title: 'ЖК Вестердам 50 кв.м',
    imageSrc:
      'https://rekvart.ru/upload/resize_cache/iblock/0fe/555_345_2/gxvnzwvdej7xxuww9y9cvvjz62qewy1e.jpg',
    description:
      'Маленькая квартира 50 кв.м в ЖК Вестердам — это всегда вызов для дизайнеров и строителей. Работа была непростой, но мы приложили все усилия, чтобы создать комфортное и функциональное пространство. Клиент был в полном восторге!',
  },
  {
    title: 'Улица Удальцова 84 кв.м',
    imageSrc:
      'https://rekvart.ru/upload/resize_cache/iblock/2c4/555_345_2/cpp5c3864p5608q9ok0b2y2du6nscz0f.jpg',
    description:
      'Проект на улице Удальцова оказался довольно сложным — старый фонд с неровными стенами и сложной планировкой. Но мы не сдались и сделали все возможное, чтобы превратить это в современное жилое пространство. Заказчик остался очень доволен!',
  },
  {
    title: 'ЖК Событие 75 кв.м',
    imageSrc:
      'https://rekvart.ru/upload/resize_cache/iblock/9b7/555_345_2/3d5psbqdlm5peuwhgd8q38hr3gascq5w.png',
    description:
      'Ремонт в ЖК Событие был непростым — требовалось учесть множество деталей и создать уютное пространство в ограниченной площади. Мы приложили максимум усилий, и результат превзошел ожидания. Клиент был в полном восторге от проделанной работы!',
  },
];

const contactData = {
  address:
    'Приглашаем в наш шоурум: м. Римская / м. Площадь Ильича, ш. Энтузиастов, 2. Бизнес-центр Golden-Gate',
  managerText: 'Посмотрите больше кейсов в наших соц.сетях',
  buttons: [
    {
      text: 'Вконтакте →',
      url: 'https://vk.com/club229772574',
    },
    {
      text: 'WhatsApp →',
      url: 'https://api.whatsapp.com/send/?phone=%2B79167892015&text&type=phone_number&app_absent=0',
    },
  ],
};

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const commentService = app.get(CommentService);
  const portfolioService = app.get(PortfolioService);
  const contactService = app.get(ContactService);

  console.log('Clearing existing data...');

  const existingComments = await commentService.getAllComments();
  for (const comment of existingComments) {
    await commentService.deleteComment(comment.id);
  }
  console.log(`Deleted ${existingComments.length} existing comments`);

  const existingPortfolios = await portfolioService.getAllPortfolios();
  for (const portfolio of existingPortfolios) {
    await portfolioService.deletePortfolio(portfolio.id);
  }
  console.log(`Deleted ${existingPortfolios.length} existing portfolios`);

  console.log('Inserting new data...');

  for (const review of reviews) {
    await commentService.createComment(review.name, review.date, review.text);
  }
  console.log(`Inserted ${reviews.length} reviews`);

  for (const item of portfolioItems) {
    console.log(`Inserting portfolio: ${item.title}`);
    console.log(`Description: ${item.description.substring(0, 50)}...`);
    const created = await portfolioService.createPortfolio(
      item.imageSrc,
      item.title,
      item.description,
    );
    console.log(
      `Created with ID: ${created.id}, description length: ${created.description.length}`,
    );
  }
  console.log(`Inserted ${portfolioItems.length} portfolio items`);

  await contactService.updateContact(
    contactData.address,
    contactData.managerText,
    contactData.buttons,
  );
  console.log('Updated contact information');

  console.log('Database population completed!');
  await app.close();
}

bootstrap().catch((error) => {
  console.error('Error populating database:', error);
  process.exit(1);
});

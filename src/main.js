const fetchCatalog = async () => {
  const URL =
    "https://67373faaaafa2ef2223329b8.mockapi.io/supercell_otpravka_koda";

  const data = await fetch(URL).then((res) => res.json());

  return data[0].result[0];
};

const searchPage = async () => {
  const categoryName = document.querySelector("[data-category-name]");

  const data = await fetchCatalog();

  console.log(data);

  categoryName.textContent = data.category_name;
  renderLinks(data.product_groups);

  data.product_groups.forEach((group) => {
    renderCards(group, data);
  });
};

searchPage();

const renderLinks = (groups) => {
  const searchGroup = document.querySelector("[data-search-nav]");

  groups.forEach((obj) => {
    const link = createLink(obj);

    searchGroup.appendChild(link);
  });
};

const renderCards = (group, data) => {
  const searchCards = document.querySelector("[data-search-cards]");

  const cardsGroup = createGroup(group);
  const cardsGroupPlace = cardsGroup.querySelector(".search-result__cards");

  const products = data.products.filter((product) => {
    return product.group_id === cardsGroup.id;
  });

  products.forEach((obj) => {
    const card = createCard(obj);
    cardsGroupPlace.appendChild(card);
  });

  searchCards.appendChild(cardsGroup);
};

const createGroup = (data) => {
  const group = document.createElement("div");
  group.className = "search-result";
  group.id = data.id;

  group.innerHTML = `
    <div class="search-result__title">${data.name}</div>
    <div class="search-result__cards"></div>
  `;

  return group;
};

// Utils
const createCard = (data) => {
  const card = document.createElement("div");
  card.className = "card";
  console.log(data);

  card.innerHTML = `
   <img src="${data.product_image_url}" alt="" class="card__img" />

    <div class="card__top">
      <div class="card__row">
        <div class="card__text">30 гемов</div>
        <div class="card__text">249 руб</div>
      </div>
      <div class="card__row">
        <div class="card__name">Brawl Stars</div>
        <div class="card__stars">
          <img src="/public/star.svg" alt="" class="stars__img" />
          <img src="/public/star.svg" alt="" class="stars__img" />
          <img src="/public/star.svg" alt="" class="stars__img" />
          <img src="/public/star.svg" alt="" class="stars__img" />
          <img src="/public/star.svg" alt="" class="stars__img" />
        </div>
      </div>
    </div>

    <div class="card__actions">
      <a href="#" class="btn btn-reset">Купить</a>
      <a href="#" class="btn-secondary btn-reset">Купить</a>
    </div>
  `;

  return card;
};

const createLink = (data) => {
  const link = document.createElement("a");
  link.className = "search-nav__btn btn-reset";
  link.href = `#${data.id}`;
  link.textContent = `${data.name}`;

  return link;
};

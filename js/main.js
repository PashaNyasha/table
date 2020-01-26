// Кнопки выбора какой массив загрузить, маленький или большой
const loadingWindow = document.querySelector(`.load`);
const min = loadingWindow.querySelector(`#min`);
const max = loadingWindow.querySelector(`#max`);

min.onclick = function() {
    giveUrlToGetData(`http://www.filltext.com/?rows=32&id={number|1000}&firstName={firstName}&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}`);
}

max.onclick = function() {
        giveUrlToGetData(`http://www.filltext.com/?rows=1000&id={number|1000}&firstName={firstName}&delay=3&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}`);
    }
    // Выдать ссылку функции getData
function giveUrlToGetData(url) {
    getData(url);
}

// GET запрос
// Выгрузить json файл и спарсить
// Полученный массив отдать в конструктор
function getData(url) {
    min.classList.add(`none`);
    max.classList.add(`none`);
    document.querySelector(`#loading`).style = `display: initial;`;
    fetch(url)
        .then(response => {
            if (response.status === 200) {
                response.json().then(result => {
                    // Вызвать конструктор и отдать ему полученный массив
                    new Paginator(result).createPage();
                    loadingWindow.className = `hide`;
                });
            }
        })
        .catch(err => console.log(`Ошибка: ${err}`));
}

class Paginator {
    constructor(arr) {
        // Получить массив
        this.array = arr;
        // Кол-во элементов на странице
        // Если меньше 50, то выдать сколько есть, иначе выдать 50
        this.elemsOnPage = this.array.length < 50 ? this.array.length : 50;
        // Получаем общее число страниц
        // Делим длину массива на кол-во элементов
        this.pageCount = Math.ceil(this.array.length / this.elemsOnPage);
        // Текущая страница
        this.pageNum = 1;
        // Стартовая точка для цикла
        this.start = 0;
        // Кнопка перелистывания вперед
        this.next = document.querySelector(`#next`);
        this.next.onclick = () => this.nextPage();
        // И назад
        this.prew = document.querySelector(`#prew`);
        this.prew.onclick = () => this.prewPage();
        // Таблица
        this.table = document.querySelector(`table`);
        // Элементы в оглавлении таблицы
        this.th = this.table.querySelectorAll(`th`);
        // Перебрать все th в оглавлении и на клике выдать параметры в функцию сортировки
        this.th.forEach((elem, i, arr) => elem.onclick = () => {
            this.sortPage(elem.getAttribute(`data-param`), elem, arr);
        });
        // Хранилище элементов для копирования
        this.template = document.querySelector(`template`).content;
        // Строка для копирования из template
        this.tr = this.template.querySelector(`tr`);
        // Тело таблицы для копирования
        this.tbody = this.template.querySelector(`tbody`);
        // Нахожу все созданные страницы
        this.tbodys = this.table.getElementsByTagName(`tbody`);
        // Забираю все созданные строки
        this.rowsInBodys = this.table.getElementsByTagName(`tr`);
        // Форма поиска
        this.searchForm = document.querySelector(`#search-form`);
        // Поле ввода
        this.text = this.searchForm.querySelector(`#search-inp`);
        // Кнопка отправки
        this.searchButton = this.searchForm.querySelector(`#search-button`);
        // Кнопка вызова формы 
        this.addButton = document.querySelector(`#add-row`);
        // Форма добавления строк
        this.addRowForm = document.querySelector(`.add-new-row form`);
        // Див куда поместится выбранная строка
        this.selectedRow = document.querySelector(`.selected`);
        this.pages();
        this.search();
        this.addNewRow();
    }

    // При вызове конструктора рассчитать максимальное кол-во страниц
    // и добавить в список
    pages() {
        this.ul = document.querySelector(`.page-numbers nav ul`);
        // Создать номера от 1
        for (let i = 1; i <= this.pageCount; i++) {
            let li = document.createElement(`li`);
            li.textContent = i;
            this.ul.appendChild(li);
        }
        // Забираю коллекцию номеров страниц
        this.pagesNumbers = this.ul.getElementsByTagName(`li`);
        this.pageNumButton = this.ul.getElementsByTagName(`button`);
        // Первому номеру выдать класс
        this.pagesNumbers[0].className = `current-page`;
        this.changePage();
    }

    // При нажатии на номер, вывести страницу под этим номером
    changePage() {
        for (let i = 0; i < this.pagesNumbers.length; i++) {
            this.pagesNumbers[i].onclick = () => {
                this.resetClass(this.pagesNumbers, ``, this.pagesNumbers[i], `current-page`);
                for (let j = 1; j <= i + 1; j++) {
                    // Если такого tbody не существует, то создать его
                    // Иначе просто сменить класс
                    if (this.tbodys[j - 1] == undefined) {
                        this.pageNum = j;
                        this.resetClass(this.tbodys, `hidden`, this.tbodys[this.pageNum - 1]);
                        this.createPage();
                    } else {
                        this.pageNum = i;
                        this.resetClass(this.tbodys, `hidden`, this.tbodys[j - 1], `show`);
                    }
                }
            }
        }
    }

    stopCounter() {
        this.pageNum = this.pageNum >= this.pageCount ? this.pageCount :
            this.pageNum <= 1 ? 1 : this.pageNum;
    }

    // По нажатию на стрелку справа перевернуть страницу вперёд
    nextPage() {
        // Сменить класс у страницы если она существует и в ней есть строки
        // Иначе создать страницу и загрузить в неё строки
        ++this.pageNum;
        this.stopCounter();
        if (this.tbodys[this.pageNum - 1] == undefined) {
            this.createPage()
            this.resetClass(this.tbodys, `hidden`, this.tbodys[this.pageNum - 1], `show`);
            this.resetClass(this.pagesNumbers, ``, this.pagesNumbers[this.pageNum - 1], `current-page`);
        } else {
            this.resetClass(this.tbodys, `hidden`, this.tbodys[this.pageNum - 1], `show`);
            this.resetClass(this.pagesNumbers, ``, this.pagesNumbers[this.pageNum - 1], `current-page`);
        }
    }

    // Нажав на стрелку слева, перевернуть назад
    prewPage() {
        // Показать предыдущую страницу
        --this.pageNum;
        this.stopCounter();
        this.resetClass(this.tbodys, `hidden`, this.tbodys[this.pageNum - 1], `show`);
        this.resetClass(this.pagesNumbers, ``, this.pagesNumbers[this.pageNum - 1], `current-page`);
    }

    // Создаём новые страницы для таблицы
    createPage() {
        // Создаю клон tbody
        const cloneTbody = this.tbody.cloneNode(false);
        // Нумерую
        cloneTbody.setAttribute(`data-n`, this.pageNum);
        // Последний индекс элемента на странице
        this.end = this.elemsOnPage * this.pageNum;
        for (let i = this.start; i < this.array.length; i++) {
            if (i < this.end || i > this.array.length - 1) {
                this.createRows(this.array[i], cloneTbody);
            }
        }
        this.start = this.end;
        this.selectRow();
    }

    // Создаём новые строки в страницах
    createRows(options, tbody, noData) {
        // Клонирую tr вместе с потомками из template
        const cloneTr = this.tr.cloneNode(true);
        // Забираю все td из клона tr
        const tds = cloneTr.querySelectorAll(`td`);
        // И заполняю данными из объектов
        tds[0].textContent = options.id;
        tds[1].textContent = options.firstName;
        tds[2].textContent = options.lastName;
        tds[3].textContent = options.email;
        tds[4].textContent = options.phone;
        // В аттрибуты добавляю остальные данные, если они есть
        if (!noData) {
            cloneTr.setAttribute(`data-address`, options.address.streetAddress);
            cloneTr.setAttribute(`data-city`, options.address.city);
            cloneTr.setAttribute(`data-state`, options.address.state);
            cloneTr.setAttribute(`data-zip`, options.address.zip);
            cloneTr.setAttribute(`data-desc`, options.description);
        }
        // Добавляю строку tr в tbody
        tbody.appendChild(cloneTr);
        // tbody добавляю в таблицу
        this.table.appendChild(tbody);
    }

    // Всем элементам коллекции задать один класс
    // Если указан элемент для показа на странице
    // Выдать ему класс show
    resetClass(arr, hideClass, showElem, showClass) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].className = hideClass;
        }
        if (showElem) showElem.className = showClass;
    }

    // Сортировка массива по заданным параметрам
    sortPage(parameter, topElem, topElemsArr) {
        // Фильтры сортировки по возрастанию и убыванию
        const sortedUpBy = param => (a, b) => a[param] > b[param] ? 1 : -1;
        const sortedDownBy = param => (a, b) => a[param] < b[param] ? 1 : -1;
        // В CSS классах up и down находятся псевдоэлементы которые укажут на направление сортировки 
        // Проверяю если у элемента класс up, сменить его на down и осортировать по убыванию
        if (topElem.classList.contains(`up`)) {
            this.array.sort(sortedUpBy(parameter));
            topElem.className = `down`;
        } else {
            // И наоборот
            // При нажатии на th, у остальных th сбросится класс с up на down
            this.resetClass(topElemsArr, `down`);
            topElem.className = `up`;
            this.array.sort(sortedDownBy(parameter));
        }
        // Затем переписываю значения в таблице
        // Первая строка содержит заголовок, по этому её обойдем
        let i = 1;
        let j = 0;
        while (i <= this.end) {
            const td = this.rowsInBodys[i].querySelectorAll(`td`);
            td[0].textContent = this.array[j].id;
            td[1].textContent = this.array[j].firstName;
            td[2].textContent = this.array[j].lastName;
            td[3].textContent = this.array[j].email;
            td[4].textContent = this.array[j].phone;
            i++;
            j++;
        }
    }

    // Поиск в строках
    search() {
        const removeRows = () => {
            // На странице с найденным удалить строки, а затем саму страницу
            let del = this.table.querySelector(`.found`).children.length - 1;
            while (this.table.querySelector(`.found`).children[0]) {
                this.table.querySelector(`.found`).children[del].remove();
                del--;
            }
            this.table.querySelector(`.found`).remove();
        }

        const showFound = foundArr => {
            if (foundArr.length > 0) {
                // Блокирую прокрутку
                this.ul.style = `display: none`;
                this.prew.disabled = true;
                this.next.disabled = true;

                if (this.table.querySelector(`.found`)) removeRows();
                // Скрыть все страницы
                this.resetClass(this.tbodys, `hidden`);
                // Создать нову и положить туда найденные строки
                const cloneTbody = this.tbody;
                cloneTbody.className = `found`;

                foundArr.forEach(elem => this.createRows(elem, cloneTbody));
                this.table.appendChild(cloneTbody);
                // Показать выделенную в блоке ниже из найденного
                this.selectRow();
            }
        }

        // Удалить страницу с найденным и показать текущую страницу таблицы
        const hideFound = () => {
            this.resetClass(this.pagesNumbers, ``)
            this.ul.style = `display: `;
            this.prew.disabled = false;
            this.next.disabled = false;
            if (this.table.querySelector(`.found`)) removeRows();
            this.resetClass(this.tbodys, `hidden`, this.tbodys[this.pageNum - 1], `show`);
        }

        this.searchForm.onsubmit = e => {
            e.preventDefault();
            // Массив куда войдут найденные элементы
            const found = [];
            // Если поле пустое - ничего не выводить
            if (this.text.value.length < 1) hideFound();
            else {
                this.array.filter(elem => {
                    // Перевожу строковые значения свойств объектов и значение поля
                    // в нижний регистр
                    if (this.text.value == elem.id ||
                        this.text.value.toLowerCase() === elem.firstName.toLowerCase() ||
                        this.text.value.toLowerCase() === elem.lastName.toLowerCase() ||
                        this.text.value.toLowerCase() === elem.email.toLowerCase() ||
                        this.text.value === elem.phone) {
                        found.push(elem);
                    }
                });
                showFound(found);
            }
        }
    }

    // Отобразить выбранное поле под таблицей
    selectRow() {
        // Забираю все span и textarea
        const allSpanInSelected = this.selectedRow.querySelectorAll(`span`);
        const textarea = this.selectedRow.querySelector(`textarea`);
        for (let i = 1; i < this.rowsInBodys.length; i++) {
            this.rowsInBodys[i].onclick = () => {
                // Показываю див
                this.selectedRow.classList.remove(`none`);
                // Прокрутить страницу до дива
                window.scrollTo({
                    top: this.selectedRow.getBoundingClientRect().y,
                    behavior: `smooth`
                })

                // Из выбранного элемента забираю имя и фамилию
                const rowTd = this.rowsInBodys[i].children;
                // Спаны и текстовое поле заполняю данными из аттрибутов data
                allSpanInSelected[0].textContent = `${rowTd[1].textContent} ${rowTd[2].textContent}`;
                textarea.value = this.rowsInBodys[i].getAttribute(`data-desc`);
                allSpanInSelected[1].textContent = this.rowsInBodys[i].getAttribute(`data-address`);
                allSpanInSelected[2].textContent = this.rowsInBodys[i].getAttribute(`data-city`);
                allSpanInSelected[3].textContent = this.rowsInBodys[i].getAttribute(`data-state`);
                allSpanInSelected[4].textContent = this.rowsInBodys[i].getAttribute(`data-zip`);
            }
        }
    }

    addNewRow() {
        // По нажатию на кнопку добавить выпадет окно с формой
        this.addButton.onclick = () => document.querySelector(`.add-new-row`).classList.toggle(`show-form`);
        // По нажатию на крестик или на клавишу Escape - убрать окно
        const closeButton = document.querySelector(`#closemodal`);
        closeButton.onclick = () => closeModal();
        const closeModal = () => document.querySelector(`.add-new-row`).classList.toggle(`show-form`);
        window.onkeydown = e => {
                if (e.code === `Escape`) closeModal();
            }
            // Создаю счетчик. Если длина значения поля больше нуля и меньше одного, прибавить один
            // Меньше нуля - убавить на один
        const inputs = this.addRowForm.querySelectorAll(`input[type='text']`);
        const submitButton = this.addRowForm.querySelector(`input[type='submit']`);
        // Счётчик заполненных полей
        let counter = 0;
        inputs.forEach(elem => elem.onchange = () => {
            // Если счетчик равен кол-ву полей, разблокировать кнопку submit
            if (elem.value.length > 0 && elem.value.length < 2) counter++;
            if (elem.value.length < 1) counter--;
            console.log(counter)
            submitButton.disabled = counter == 5 ? false : true;
        })

        // Новую запись добавить в начало массива и в начало таблицы
        this.addRowForm.onsubmit = e => {
            e.preventDefault();
            this.array.unshift({
                id: inputs[0].value,
                firstName: inputs[1].value,
                lastName: inputs[2].value,
                email: inputs[3].value,
                phone: inputs[4].value
            });
            this.createRows(this.array[0], this.tbodys[0], true);
            this.tbodys[0].insertBefore(this.tbodys[0].children[this.tbodys[0].children.length - 1],
                this.tbodys[0].children[0]);
            // Обновляю цикл для выбора строки
            this.selectRow();
        }
    }
}
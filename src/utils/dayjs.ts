import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/uk";
import "dayjs/locale/ru";

// customParseFormat нужен для разбора строк по шаблону, например dayjs(date, "YYYY-MM-DD HH:mm:ss").
dayjs.extend(customParseFormat);

export default dayjs;

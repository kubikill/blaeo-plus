type TagOption = {
  label: string;
  color: string;
};

type blaeoPlusSave = {
  name: string;
  content: string;
};

interface JQuery<Element> {
  sortable_table(mode: string, columnIndex: number, order: boolean): null;
}

declare module "*.svelte" {
  export { SvelteComponentDev as default } from "svelte/internal";
}

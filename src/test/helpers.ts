function assertHtmlInputElement(element: HTMLElement): asserts element is HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`Expected HTMLInputElement but got ${element.constructor.name}`);
  }
}

export { assertHtmlInputElement };

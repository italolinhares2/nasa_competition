const SVG_NS = 'http://www.w3.org/2000/svg';

function applyProps(el, props) {
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.setAttribute('class', value);
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in el && !(el instanceof SVGElement)) el[key] = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
}

function appendChildren(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** Cria elementos HTML: h('button', { class: 'btn', onClick }, 'Texto'). */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  applyProps(el, props);
  appendChildren(el, children);
  return el;
}

/** Cria elementos SVG com o namespace correto. */
export function svg(tag, props, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  applyProps(el, props);
  appendChildren(el, children);
  return el;
}

/** Substitui todo o conteúdo de um nó. */
export function mount(parent, ...children) {
  parent.replaceChildren();
  appendChildren(parent, children);
  return parent;
}

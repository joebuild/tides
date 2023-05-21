/// <reference types="@sveltejs/kit" />

declare module '*.svg?src' {
  const content: string;
  export default content;
}

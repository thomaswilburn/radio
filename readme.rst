Radios Hack
===========

I built this as an experiment in creating a small web app built almost entirely out of Web Components, organized via ES modules. It turned out okay! Here's how it works:

1. The top-level page imports and instantiates an ``<audio-player>`` and a ``<feed-collection>``.
2. The feed collection in turn loads the subscription URLs from localStorage, and assigns those to ``<feed-listing>`` elements.
3. The feed listings make XHR requests for the podcast feeds (if ``?useproxy`` is set in the page URL, it'll route through a local Node proxy to get around CORS restrictions), and then creates ``<feed-item>`` elements for each episode.
4. Individual components don't try to directly talk to each other -- they dispatch events instead.

   * Clicking on episodes sends an event back up to the document body, where it's intercepted by the ``main.js`` script and used to set the source for the audio player.
   * Clicking on "unsubscribe" for a feed sends an event up to the collection, which removes the element and drops it from the localStorage collection.

This is a workable model for small-to-medium apps, largely imitating a modern "attributes down, events up" data flow. For something bigger or more complex, it would probably make sense to bring in a state management system to more effectively connect JS data to each component (instead of passing strings around).

Element design
--------------

All Web Components here extend a common ``ElementBase`` instead of directly working from HTMLElement, which is just a way to codify some of the standard constructor code.

* On construction, the element creates an open shadow root immediately. This isn't necessarily better from an inspection standpoint, but it's something we can do in the constructor instead of in ``connectedCallback``, which simplifies the lifecycle.
* If the component class has a static getter method for ``template``, this will be splatted into the shadow root for the element. Most templates include a ``<style>`` tag, which gets encapsulated via the shadow DOM (hence much shorter selectors).
* Any elements in the template with an ``as="prop"`` attribute will be assigned to the element as ``elements.prop``, which makes it easier to refer to them later or bind events immediately.
* If the component class has a static getter method for ``boundMethods``, those methods will have their context bound to the element. This greatly simplifies event listeners (e.g., ``this.elements.button.addEventListener("click", this.onClicked)``).

The use of static getters will be familiar to anyone who has used Web Components, since it's the same way the ``observedAttributes`` list is assigned for an element.

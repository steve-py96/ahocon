import{_ as s,c as n,o as a,a as o}from"./app.8289b53b.js";const C=JSON.parse('{"title":"advanced","description":"","frontmatter":{},"headers":[{"level":2,"title":"functions","slug":"functions","link":"#functions","children":[]},{"level":2,"title":"preparse","slug":"preparse","link":"#preparse","children":[]}],"relativePath":"advanced.md"}'),e={name:"advanced.md"},p=o(`<h1 id="advanced" tabindex="-1">advanced <a class="header-anchor" href="#advanced" aria-hidden="true">#</a></h1><p>What is &quot;advanced&quot; AHOCON? Well as often in coding you can do kinda nasty stuff somewhere in the libraries - AHOCON is no exception here.</p><h2 id="functions" tabindex="-1">functions <a class="header-anchor" href="#functions" aria-hidden="true">#</a></h2><p>You can change your import from <code>import { parse } from &#39;ahocon&#39;</code> to <code>import { parse } from &#39;ahocon/extended&#39;</code> to integrate function parsing. Importing the extended version of AHOCON expands the grammar. To use functions you need to provide them, there are none defined out-of-the box inside the parser.</p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#89DDFF;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">parse</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">ahocon/extended</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#82AAFF;">parse</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">example = true</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">functions</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// your functions here, can also be nested objects (aka emulating namespaces)</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span></code></pre></div><p>AHOCON provides some predefined example functions within the <code>ahocon/funcs</code>-subdirectory, but you&#39;re able to create your owns, just be inspired: <a href="https://github.com/steve-py96/ahocon/tree/main/src/funcs/" target="_blank" rel="noreferrer">https://github.com/steve-py96/ahocon/tree/main/src/funcs/</a></p><p>Let&#39;s say you include the math namespace...</p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#89DDFF;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">parse</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">ahocon</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">as</span><span style="color:#A6ACCD;"> math </span><span style="color:#89DDFF;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">ahocon/funcs/math</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// math = { add, subtract, divide, multiply }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#82AAFF;">parse</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">example = true</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">functions</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    math</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">AHOCON</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki"><code><span class="line"><span style="color:#A6ACCD;">a = $math.add(1,2,3)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div></div><p>Result would be <code>{ &quot;a&quot;: 6 }</code>.</p><p>What happens here is that the AHOCON parser notices the <code>$</code> and does a look-up in the config functions. Since the function name contains a dot it&#39;ll look up math as namespace and inside math for add. Once found it&#39;ll call the function with all values within the parenthesis parsed (so 1 2 and 3 are passed as numbers, not strings).</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>A namespace is of course no must, if you import it like <code>import { add } from &#39;ahocon/funcs/math&#39;</code> and include it alone like <code>functions: { add }</code> it&#39;ll be called via <code>$add(...)</code>.</p></div><div class="danger custom-block"><p class="custom-block-title">DANGER</p><p>It&#39;s in general discouraged to use namespace imports (since they ruin tree-shaking), but in case you define a file full of functions and use the namespace here it&#39;d be completely fine (just to underline that general bad practice is not always bad).</p></div><div class="danger custom-block"><p class="custom-block-title">DANGER</p><p>Note: It&#39;s not recommended to use heavy operations in these functions, they&#39;re for light operations or light extensions (you might use this library in node and connect the fs with configs for example, but it shouldn&#39;t be used for rocket launches \u{1F604}). If you wanna launch rockets analyse / modify the outcoming object instead!</p></div><p>If you wanna write your own functions: Your function will receive:</p><div class="language-typescript"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki"><code><span class="line"><span style="color:#C792EA;">interface</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">CustomFunctionParams</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">args</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Array</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">unknown</span><span style="color:#89DDFF;">&gt;;</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">root</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">AHOCON</span><span style="color:#89DDFF;">.</span><span style="color:#FFCB6B;">PickNode</span><span style="color:#89DDFF;">&lt;</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">root</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">&gt;;</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">node</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">AHOCON</span><span style="color:#89DDFF;">.</span><span style="color:#FFCB6B;">PickNode</span><span style="color:#89DDFF;">&lt;</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">function</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">&gt;;</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">parseNode</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">node</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">AHOCON</span><span style="color:#89DDFF;">.</span><span style="color:#FFCB6B;">Node</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">unknown</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>It&#39;s recommended here to write as many assertions for the arguments as possible (f.e. in math libraries you should always assert every value to be a number). <code>args</code> are the arguments provided in the AHOCON config, <code>root</code> is the top-node in the AHOCON parsing AST (yes, it&#39;s a simplistic AST!), node is the current node (of the function itself). <code>parseNode</code> can be helpful if you analyse other nodes in the tree and need their value. To finish your function you don&#39;t return the value: you set it via <code>node.evaluated = ...</code> (yes mutations are mostly disgusting without observables but it saves memory and further logic here).</p><div class="danger custom-block"><p class="custom-block-title">DANGER</p><p>Note: AHOCON doesn&#39;t protect you from building endless loops with functions (which is possible with the example <code>ahocon/funcs/ref</code> function). For example:</p><div class="language-typescript"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki"><code><span class="line"><span style="color:#89DDFF;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">parse</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">ahocon</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">ref</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">ahocon/funcs/ref</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#82AAFF;">parse</span><span style="color:#A6ACCD;">(</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">\`</span></span>
<span class="line"><span style="color:#C3E88D;">  # how it&#39;s supposed to be used, good_b will be 1 too</span></span>
<span class="line"><span style="color:#C3E88D;">  good_a = 1</span></span>
<span class="line"><span style="color:#C3E88D;">  good_b = ref($good_a)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C3E88D;">  # how it can be misused (they&#39;ll crash due to an endless loop)</span></span>
<span class="line"><span style="color:#C3E88D;">  a = $ref(b)</span></span>
<span class="line"><span style="color:#C3E88D;">  b = $ref(a)</span></span>
<span class="line"><span style="color:#89DDFF;">\`</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">functions</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">      ref</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span></code></pre></div></div><h2 id="preparse" tabindex="-1">preparse <a class="header-anchor" href="#preparse" aria-hidden="true">#</a></h2><p>AHOCON goes through 2 steps when parsing:</p><ol><li>parse the input string to AST-nodes</li><li>parse the AST-nodes to an object</li></ol><p><code>preparse</code> gives the opportunity to get between those processes: You can manipulate the AST before it gets parsed.</p><div class="language-typescript"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki"><code><span class="line"><span style="color:#C792EA;">type</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">PreparseHook</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">AHOCON</span><span style="color:#89DDFF;">.</span><span style="color:#FFCB6B;">ParseNode</span><span style="color:#89DDFF;">&lt;</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">root</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">&gt;)</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">unknown</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span></code></pre></div><p>Since everything is possible here there&#39;s not much to say but enjoy to discover \u{1F604}.</p>`,24),l=[p];function t(c,r,i,y,D,F){return a(),n("div",null,l)}const u=s(e,[["render",t]]);export{C as __pageData,u as default};

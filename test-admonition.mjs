import { mdsvex } from 'mdsvex';
import { admonitionPreprocessor } from './markdown-plugins/preprocess-admonition-import.js';

const sample = `---
title: テスト
description: テストページ
---

導入文

:::tip
初心者の方はnpmを使用することをお勧めします。
:::

中間の段落

:::warning[要注意]
レガシー API は将来廃止されます。

複数段落も書ける。
:::

:::info[**太字** ありタイトル]
本文に **Markdown** も使える。

段落 2。
:::

:::note
デフォルトタイトル（補足）が出るはず。
:::

以下はコードフェンス内なので変換されないはず:

\`\`\`markdown
:::tip
これは例示なので変換されてはいけない
:::
\`\`\`

終わり。
`;

const filename = '/fake/path/test.md';

const pre = admonitionPreprocessor();
const afterPre = pre.markup({ content: sample, filename })?.code ?? sample;

console.log('=== After admonitionPreprocessor ===');
console.log(afterPre);
console.log();

const mdsvexPre = mdsvex({ extensions: ['.md'] });
const result = await mdsvexPre.markup({ content: afterPre, filename });
console.log('=== After mdsvex ===');
console.log(result?.code ?? '(no code)');

<script lang="ts">
  interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
    tags: string[];
  }
  
  interface TodoList {
    title: string;
    items: TodoItem[];
    metadata: {
      createdAt: Date;
      updatedAt: Date;
      author: {
        name: string;
        email: string;
      };
    };
  }
  
  let todoList = $state<TodoList>({
    title: 'プロジェクトタスク',
    items: [
      {
        id: 1,
        text: '設計書作成',
        completed: false,
        tags: ['重要', '急ぎ']
      }
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      author: {
        name: '山田太郎',
        email: 'yamada@example.com'
      }
    }
  });
  
  // 深くネストされたプロパティの更新もリアクティブ
  function updateAuthorName(name: string) {
    todoList.metadata.author.name = name; // UIが更新される
  }
  
  function addTag(itemId: number, tag: string) {
    const item = todoList.items.find(i => i.id === itemId);
    if (item) {
      item.tags.push(tag); // 深いレベルの配列操作もリアクティブ
    }
  }
</script>
// サイドバー開閉状態
class SidebarState {
	open = $state(false);

	toggle() {
		this.open = !this.open;
	}

	close() {
		this.open = false;
	}
}

export const sidebar = new SidebarState();

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}

export class UserManager {
    users: User[] = [];

    addUser(user: User): void {
      if (!user.id) {
        throw new Error('User must have an id');
      }
      if (this.users.find(u => u.id === user.id)) {
        throw new Error(`User with id ${user.id} already exists`);
      }
      
      this.users.push(user);
    }

    removeUser(id: string): void {
      if (!this.users.find(u => u.id === id)) {
        throw new Error(`User with id ${id} not found`);
      }

      this.users = this.users.filter(u => u.id !== id);
    }

    getUser(id: string): User | null {
      return this.users.find(u => u.id === id) ?? null;
    }

    getUsersByEmail(email: string): User[] | null {
      return this.users.filter(u => u.email === email);
    }

    getUsersByPhone(phone: string): User[] | null {
      return this.users.filter(u => u.phone === phone);
    }

    getAllUsers(): User[] {
      return this.users;
    }

    getUserCount(): number {
      return this.users.length;
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contact } from './contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact)
    private contactModel: typeof Contact,
  ) {}

  async getContact(): Promise<Contact | null> {
    const contact = await this.contactModel.findByPk('singleton');
    return contact;
  }

  async updateContact(
    address: string,
    managerText: string,
    buttons?: Array<{
      text: string;
      url: string;
    }>,
  ): Promise<Contact> {
    const updateData: Partial<Contact> & { id: string } = {
      id: 'singleton',
      address,
      managerText,
    };
    if (buttons !== undefined) {
      updateData.buttons = JSON.stringify(buttons);
    }
    const [contact] = await this.contactModel.upsert<Contact>(updateData);
    return contact;
  }
}

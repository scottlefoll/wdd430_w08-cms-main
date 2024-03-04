import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { Contact } from '../contact.model';
import { ContactService } from '../contact.service';

@Component({
  selector: 'cms-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.css']
})
export class ContactEditComponent implements OnInit {
  @ViewChild('contactEditForm') contactEditForm: NgForm;
  contact: Contact;
  newContact: Contact;
  groupContacts: Contact[] = [];
  private editMode: boolean = false;
  invalidContact: boolean = false;
  id: string;
  subscription: Subscription;

  constructor(
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.subscription = this.route.params.subscribe (
      (params: Params) => {
        this.id = params['id'];
        if (this.id === null || this.id === undefined) {
          this.contactService.setEditMode(false);
          return;
        }
        this.contact = this.contactService.getContact(this.id);

        if (this.contact === null || this.contact === undefined) {
          return;
        }
        this.contactService.setEditMode(true);
        // clone the contact object to a new object
        this.newContact = JSON.parse(JSON.stringify(this.contact));
        // if the contact has a group then clone the group
        if (this.contact.group) {
          this.groupContacts = JSON.parse(JSON.stringify(this.contact.group));
        }
      }
    );
  }

  onSubmit(form: NgForm) {
    alert('onSubmit');
    this.newContact = new Contact( this.contact.id, '', '', '', null);
    this.newContact.name = form.value.name;
    this.newContact.email = form.value.email;
    this.newContact.phone = form.value.phone;
    this.newContact.imageUrl = form.value.imageUrl;

    if (this.contactService.getEditMode()) {
      alert('update contact' + this.newContact);
      this.contactService.updateContact(this.contact, this.newContact)
    } else {
      alert('add contact' + this.newContact);
      this.contactService.addContact(this.newContact);
    }

    this.router.navigate(['/contacts']);
  }

  onCancel() {
    this.router.navigate(['/contacts']);
  }

  onDrop(event: CdkDragDrop<Contact>) {
    if (event.previousContainer !== event.container) {
      const contactCopy = {...event.item.data };
      const invalidGroupContact = this.isInvalidContact(contactCopy);
      if (invalidGroupContact){
         return;
      }
      this.groupContacts.push(contactCopy);
      console.log('Updated groupContacts:', this.groupContacts);
      alert('Updated groupContacts:' + this.groupContacts);
    }
  }

  isInvalidContact(newContact: Contact) {
    if (!newContact) {
      this.invalidContact = true;
      return true;
    }
    if (newContact && newContact.id === this.contact.id) {
      this.invalidContact = true;
      return true;
    }
    for (let i = 0; i < this.groupContacts.length; i++) {
      if (newContact.id === this.groupContacts[i].id) {
        this.invalidContact = true;
        return true;
      }
    }
    return false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onRemoveItem(index: number) {
    if (index < 0 || index >= this.groupContacts.length) {
       return;
    }
    this.groupContacts.splice(index, 1);
  }
}

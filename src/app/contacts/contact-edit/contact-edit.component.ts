import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { Contact } from '../contact.model';
import { ContactService } from '../contact.service';
import { CanComponentDeactivate } from '../../shared/can-deactivate-guard.service';

@Component({
  selector: 'cms-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.css']
})
export class ContactEditComponent implements OnInit, CanComponentDeactivate {
  @ViewChild('contactEditForm') contactEditForm: NgForm;
  contact: Contact;
  newContact: Contact;
  groupContacts: Contact[] = [];
  // private editMode: boolean = false;
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

        if (this.contact.group) {
          this.groupContacts = JSON.parse(JSON.stringify(this.contact.group));
        }

        this.contactService.setEditMode(true);
        // clone the contact object to a new object
        this.newContact = JSON.parse(this.stringifyWithoutCircular(this.contact));
      }
    );
  }

  stringifyWithoutCircular(obj: any): string {
    const cache = new Set();

    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          // Circular reference found, discard key
          return;
        }
        cache.add(value);
      }
      return value;
    });
  }

  onSubmit(form: NgForm) {
    this.newContact = new Contact(
      this.contact.id,
      form.value.name,
      form.value.email,
      form.value.phone,
      form.value.imageUrl,
      this.groupContacts);

    if (this.contactService.getEditMode()) {
      this.contactService.updateContact(this.contact, this.newContact)
    } else {
      this.contactService.addContact(this.newContact);
    }
    this.router.navigate(['/contacts']);
  }

  onCancel() {
    if (this.canDeactivate()) {
      this.router.navigate(['/contacts']);
    }
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.contactEditForm.dirty) {
      return confirm('Do you want to discard the changes?');
    } else {
      return true;
    }
  }

  onDrop(event: CdkDragDrop<Contact>) {
    if (event.previousContainer !== event.container) {
      const contactCopy = {...event.item.data };
      const invalidGroupContact = this.isInvalidContact(contactCopy);

      if (invalidGroupContact){
        this.invalidContact = true;
        return;
      }

      this.groupContacts.push(contactCopy);
      // Manually set the form to be dirty
      this.contactEditForm.form.markAsDirty();
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
    this.invalidContact = false;
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

import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';

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
  editMode: boolean = false;
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
          this.editMode = false;
          return;
        }
        this.contact = this.contactService.getContact(this.id);

        if (this.contact === null || this.contact === undefined) {
          return;
        }
        this.editMode = true;
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
    this.newContact = new Contact( this.contact.id, '', '', '', null);
    this.newContact.name = form.value.name;
    this.newContact.email = form.value.email;
    this.newContact.phone = form.value.phone;
    this.newContact.imageUrl = form.value.imageUrl;

    if (this.editMode) {
      this.contactService.updateContact(this.contact, this.newContact)
    } else {
      this.contactService.addContact(this.newContact);
    }
    this.router.navigate(['/contacts']);
  }

  onCancel() {
    this.router.navigate(['/contacts']);
  }

  isInvalidContact(newContact: Contact) {
    if (!newContact) {
      return true;
    }
    if (newContact && newContact.id === this.contact.id) {
      return true;
    }
    for (let i = 0; i < this.groupContacts.length; i++) {
      if (newContact.id === this.groupContacts[i].id) {
        return true;
      }
    }
    return false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

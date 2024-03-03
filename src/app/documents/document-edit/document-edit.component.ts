import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { Document } from '../document.model';
import { DocumentService } from '../document.service';

@Component({
  selector: 'cms-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.css']
})
export class DocumentEditComponent implements OnInit {
  @ViewChild('documentEditForm') documentEditForm: NgForm;
  document: Document;
  newDocument: Document;
  editMode: boolean = false;
  id: string;
  subscription: Subscription;

  constructor(
    private documentService: DocumentService,
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
        this.document = this.documentService.getDocument(this.id);

        if (this.document === null || this.document === undefined) {
          return;
        }
        this.editMode = true;
        // clone the document object to a new object
        this.newDocument = JSON.parse(JSON.stringify(this.document));
      }
    );
  }

  onSubmit(form: NgForm) {
    this.newDocument = new Document( this.document.id, '', '', '', null);
    this.newDocument.name = form.value.name;
    this.newDocument.description = form.value.description;
    this.newDocument.url = form.value.url;
    this.newDocument.children = form.value.children;

    if (this.editMode) {
      this.documentService.updateDocument(this.document, this.newDocument)
    } else {
      this.documentService.addDocument(this.newDocument);
    }
    this.router.navigate(['/documents']);
  }

  onCancel() {
    this.router.navigate(['/documents']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

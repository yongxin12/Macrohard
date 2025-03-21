variable "prefix" {
  description = "The prefix which should be used for all resources in this deployment"
  default     = "macrohard"
  type        = string
}

variable "location" {
  description = "The Azure Region in which all resources should be created"
  default     = "East US"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  default     = "macrohard-resources"
  type        = string
}

variable "admin_username" {
  description = "Username for the Virtual Machine"
  default     = "azureuser"
  type        = string
}

variable "vm_size" {
  description = "Size of the Virtual Machine"
  default     = "Standard_B2as_v2"
  type        = string
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key file"
  default     = "/home/rex/project/resume-editor/deployment/ec2/id_rsa.pub"
  type        = string
}

variable "tags" {
  description = "A map of the tags to use for the resources"
  type        = map(string)
  default = {
    environment = "development"
    project     = "macrohard"
  }
} 
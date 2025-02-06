class DataExport {
    async exportApplications(format = 'csv') {
        const applications = await this.getAllApplications();
        
        switch(format) {
            case 'csv':
                return this.generateCSV(applications);
            case 'pdf':
                return this.generatePDF(applications);
            case 'excel':
                return this.generateExcel(applications);
        }
    }
} 
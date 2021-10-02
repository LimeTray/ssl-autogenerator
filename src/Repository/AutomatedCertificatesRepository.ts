import { Sequelize } from "sequelize";
import { AutomatedCertificate as AutomatedCertificateInteface } from "../Declarations/AutomatedCertificateInterface";
import { CertificateNotFound } from "../Errors/CertificateNotFound";
import { AutomatedCertificates } from "../Models/AutomatedCertificates";

export class AutomatedCertificatesRepository {
    /**
     * To get certificate by hash or certificate id stored in 3p
     * @param certificateHash 
     */
    public static async getCertificateByHash(certificateHash: string) {
        const result = await AutomatedCertificates.findOne({
            where: { certificateHash }
        })
        if (!result) {
            throw new CertificateNotFound(certificateHash);
        }
        return result.toJSON() as AutomatedCertificateInteface
    }

    /**
     * To find certificate by domain name
     * @param domainName 
     * @returns 
     */
    public static async getCertificateByDomainName(domainName: string) {
        const result = await AutomatedCertificates.findOne({
            where: { domainName }
        })
        if (!result) {
            throw new CertificateNotFound(domainName);
        }
        return result.toJSON() as AutomatedCertificateInteface

    }

    /**
     * To create new Automated certificate interface
     * @param data {AutomatedCertificateInteface}
     * @returns 
     */
    public static async registerAutomatedCertificate(data: AutomatedCertificateInteface) {
        const currentDate = new Date();
        if (!data.expiryDate) {
            const expiryDate = new Date(new Date(currentDate).setDate(currentDate.getDate() + 90))
            data.expiryDate = new Date(expiryDate);
        }
        if (!data.autoRenewedOn) {
            data.autoRenewedOn = currentDate
        }
        const result = await AutomatedCertificates.create(data);
        return result.toJSON() as AutomatedCertificateInteface;
    }

    public static async updateCertificateHash(domainName: string, certificateHash: string) {
        let cert = await AutomatedCertificates.findOne({
            where: { domainName }
        })
        if (!cert) {
            throw new CertificateNotFound(domainName);
        }
        cert.set('certificateHash', certificateHash);
        await cert.save();
        cert = await cert.reload();
        return cert;
    }

    /**
     * To update challenge file only
     * @param certificateHash 
     * @param filepath 
     * @returns 
     */
    public static async updatechallengeFile(certificateHash: string, filepath: string) {
        let cert = await AutomatedCertificates.findOne({ where: { certificateHash } });
        if (!cert) {
            throw new CertificateNotFound(certificateHash);
        }
        cert.set('challengeFilePath', filepath);
        await cert.save();
        cert = await cert.reload()
        return cert.toJSON() as AutomatedCertificateInteface;
    }

    public static async updateChallengeAndKey(certificateHash: string, challenge: string, privateKey: string) {
        let cert = await AutomatedCertificates.findOne({ where: { certificateHash } });
        if (!cert) {
            throw new CertificateNotFound(certificateHash);
        }
        cert.set('challengeFilePath', challenge);
        cert.set('certificateKeyPath', privateKey);

        await cert.save();
        cert = await cert.reload()
        return cert.toJSON() as AutomatedCertificateInteface;
    }

    /**
     * 
     * @param certificateHash 
     * @param certificatespath 
     * @returns 
     */
    public static async updateCertificatePath(certificateHash: string, certificatespath: { certificateKeyPath: string, certificateCrtPat: string, certificateCaBundlePath: string }) {
        let cert = await AutomatedCertificates.findOne({ where: { certificateHash } });
        if (!cert) {
            throw new CertificateNotFound(certificateHash);
        }

        cert.set('certificateKeyPath', certificatespath.certificateKeyPath);
        cert.set('certificateCrtPath', certificatespath.certificateCrtPat);
        cert.set('certificateCaBundlePath', certificatespath.certificateCaBundlePath);

        await cert.save();
        cert = await cert.reload()
        return cert.toJSON() as AutomatedCertificateInteface;
    }

    /**
     * To update certificate renewed date
     * @param certificateHash 
     * @returns 
     */
    public static async updateAutoRenewDate(certificateHash: string) {
        let cert = await AutomatedCertificates.findOne({ where: { certificateHash } });
        if (!cert) {
            throw new CertificateNotFound(certificateHash);
        }
        cert.set('autoRenewedOn', new Date());
        await cert.save();
        cert = await cert.reload()
        return cert.toJSON() as AutomatedCertificateInteface;
    }


    public static async updateCertificates(certificateHash: string, caBundle: string, certificate: string) {
        let cert = await AutomatedCertificates.findOne({ where: { certificateHash } });
        if (!cert) {
            throw new CertificateNotFound(certificateHash);
        }

        const currentDate = new Date();
        const expiryDate = new Date(new Date(currentDate).setDate(currentDate.getDate() + 90))

        cert.set('certificateCaBundlePath', caBundle);
        cert.set('certificateCrtPath', certificate);

        // Update dates

        cert.set('autoRenewedOn', currentDate);
        cert.set('expiryDate', expiryDate);

        await cert.save();
        cert = await cert.reload()
        return cert.toJSON() as AutomatedCertificateInteface;
    }

    public static async getExpiringCertificates() {
        const literal = 'Date(CURRENT_DATE) >  Date(date_sub(expiryDate ,INTERVAL 10 DAY))'
        const res = await AutomatedCertificates.findAll({ where: Sequelize.literal(literal) })
        return res.map(x => x.toJSON()) as AutomatedCertificateInteface[]
    }
}